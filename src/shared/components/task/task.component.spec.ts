import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {NO_ERRORS_SCHEMA} from "@angular/core";
import {TaskComponent} from "./task.component";
import {SharedModule} from "../../shared.module";
import {AppModule} from "../../../app/app.module";
import {taskMock} from "../../../mock/mock";
import {MatDialog} from "@angular/material/dialog";
import {Observable, of} from "rxjs";
import {DataService} from "../../services/data.service";


const mock = taskMock[0];



describe('TaskComponent', () => {
  let component: TaskComponent;
  let fixture: ComponentFixture<TaskComponent>;
  let dialog: MatDialog;
  let dataService: DataService;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TaskComponent,
        HttpClientTestingModule,
        AppModule,
        SharedModule
      ],
      providers: [
        {
          provide: DataService,
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });



  beforeEach(() => {
    fixture = TestBed.createComponent(TaskComponent);
    component = fixture.componentInstance;
    component.task = mock;
    dialog = TestBed.inject(MatDialog);
    dataService = TestBed.inject(DataService);
    fixture.detectChanges();
  })

  it('You should change the type to "todo-doing-done".', () => {
    component.changeType('doing');
    expect(component.task.type).toEqual('doing');
    component.changeType('done');
    expect(component.task.type).toEqual('done');
    component.task.completed = false;
    component.changeType('todo');
    expect(component.task.type).toEqual('todo');
  });

  it('You should call the dialog.', () => {
    spyOn(component, 'openDialog').and.callFake(() => {
      return {
        afterClosed: () => {
          of(taskMock[0])
        }
      }
    })
    component.openDialog();
    expect(component.openDialog).toHaveBeenCalled();

  })


  it('You should call the dialog and then update its status to "done."', () => {
    // @ts-ignore
    spyOn(component.dialog, 'open').and.callFake(() => {
      return {
        beforeClosed(): Observable<any> {
          const task = { ...taskMock[0] };
          task.type = 'done';
          return of({
            event: 'save',
            data: task
          })
        }
      }
    })
    component.openDialog();
    expect(component.dialog.open).toHaveBeenCalled();
    expect(component.task.type).toEqual('done');
  })

  it('You should call the dialog and then not update its status to "done."', () => {
    // @ts-ignore
    spyOn(component.dialog, 'open').and.callFake(() => {
      return {
        beforeClosed(): Observable<any> {
          const task = { ...taskMock[0] };
          task.type = 'done';
          return of({
            event: 'cancel',
          })
        }
      }
    })
    component.openDialog();
    expect(component.dialog.open).toHaveBeenCalled();
    expect(component.task.type).toEqual('todo');
  })

  it('You should call the dialog and then update its time to 90 minutes.', () => {
    // @ts-ignore
    spyOn(component.dialog, 'open').and.callFake(() => {
      return {
        beforeClosed(): Observable<any> {
          const task = { ...taskMock[0] };
          task.estimated_time = 90;
          return of({
            event: 'save',
            data: task
          })
        }
      }
    })
    component.openDialog();
    expect(component.dialog.open).toHaveBeenCalled();
    expect(component.task.estimated_time).toEqual(90);
  })

  it('Debe abrir el dialog y luego eliminar la tarea', () => {
    // @ts-ignore
    spyOn(component.dialog, 'open').and.callFake(() => {
      return {
        beforeClosed(): Observable<any>{
          const task = {
            ...taskMock,
          }
          return of({
            event: 'delete',
            data: task
          })
        }
      }
    })
    spyOn(component, 'deleteTask').and.callThrough();
    spyOn(dataService, 'deleteTask').and.callThrough();
    const tasksBefore = dataService.getTasks;
    component.openDialog();
    expect(component.dialog.open).toHaveBeenCalled();
    expect(component.deleteTask).toHaveBeenCalled();
    expect(dataService.deleteTask).toHaveBeenCalled();
    const taskAfter = dataService.getTasks;
    expect(tasksBefore.length).toBe(taskAfter.length);
  });

});
