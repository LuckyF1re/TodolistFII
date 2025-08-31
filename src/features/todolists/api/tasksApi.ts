import { baseApi } from "@/app/baseApi"
import { instance } from "@/common/instance"
import type { BaseResponse } from "@/common/types"
import type { DomainTask, GetTasksResponse, UpdateTaskModel } from "./tasksApi.types"
import { PAGE_SIZE } from "@/common/constants"

export const tasksApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTasks: build.query<GetTasksResponse, { todolistId: string; params: { page: number } }>({
      query: ({ todolistId, params }) => {
        return {
          url: `todo-lists/${todolistId}/tasks`,
          params: {...params, count: PAGE_SIZE}
        }
      },
      keepUnusedDataFor: 5,
      // providesTags: ["Task"],

      providesTags: (result, _error, { todolistId }) => {
        // расширенный вариант
        /*return result
          ?
          [
            ...result.items.map((task) => (
              { type: 'Task', id: task.id}
            ) as const
          ),
            {type: 'Task', id: todolistId},
            ]
          :
          ['Task']*/

        // упрощенный вариант
        return result ? [{ type: "Task", id: todolistId }] : [{ type: "Task" }]
      },
      //
    }),
    addTask: build.mutation<BaseResponse<{ item: DomainTask }>, { todolistId: string; title: string }>({
      query: ({ todolistId, title }) => ({
        url: `todo-lists/${todolistId}/tasks`,
        method: "POST",
        body: { title },
      }),
      //invalidatesTags: (result, _error, { todolistId }) => {
      //  return [{ type: 'Task', id: todolistId}]
      //  },
      // упрощенный вариант
      invalidatesTags: (_result, _error, { todolistId }) => [{ type: "Task", id: todolistId }],

      //
    }),
    removeTask: build.mutation<BaseResponse, { todolistId: string; taskId: string }>({
      query: ({ todolistId, taskId }) => ({
        url: `todo-lists/${todolistId}/tasks/${taskId}`,
        method: "DELETE",
      }),
      //invalidatesTags: ["Task"],

      //
      //более расширеный вариант
      //invalidatesTags: (_result, _error, {taskId}) =>
      //  [{type: 'Task', id: taskId}],

      //
      // упрощенный вариант
      invalidatesTags: (_result, _error, { todolistId }) => [{ type: "Task", id: todolistId }],
      //
    }),
    updateTask: build.mutation<
      BaseResponse<{ item: DomainTask }>,
      { todolistId: string; taskId: string; model: UpdateTaskModel, page: number }
    >({
      query: ({ todolistId, taskId, model }) => ({
        url: `todo-lists/${todolistId}/tasks/${taskId}`,
        method: "PUT",
        body: model,
      }),

      //

     // вариант от студента проделанный Валерой:

      onQueryStarted: async ({ todolistId, taskId, model, page }, {dispatch, queryFulfilled}) => {

           const patchResult = dispatch(
              tasksApi.util.updateQueryData(
                'getTasks',
                { todolistId, params: { page: page } },
                state => {
                  const index = state.items.findIndex(task => task.id === taskId)
                  if (index !== -1) {
                    state.items[index] = { ...state.items[index], ...model }
                  }
                }
              )
            )

        try {
          await queryFulfilled
        } catch (err) {
            patchResult.undo()
        }
      },


      // варианты от Валеры
      // onQueryStarted: async ({ todolistId, taskId, model }, {dispatch, queryFulfilled, getState}) => {
      //
      //   const cachedArgsForQuery = tasksApi.util.selectCachedArgsForQuery(getState(), 'getTasks')
      //
      //   let patchResults: any[] = []
      //   cachedArgsForQuery.forEach((arg) => {
      //     patchResults.push(
      //       dispatch(
      //         tasksApi.util.updateQueryData(
      //           'getTasks',
      //           { todolistId, params: { page: arg.params.page } },
      //           state => {
      //             const index = state.items.findIndex(task => task.id === taskId)
      //             if (index !== -1) {
      //               state.items[index] = { ...state.items[index], ...model }
      //             }
      //           }
      //         )
      //       )
      //     )
      //   })
      //
      //   // работает только для захаркодженной пагинации { page: 1 }
      //   // const patchResult = dispatch(
      //   //     tasksApi.util.updateQueryData("getTasks", {todolistId, params: {page: 1}}, (state) => {
      //   //       const index = state.items.findIndex(task => task.id === taskId)
      //   //       if (index !== -1) {
      //   //         state.items[index] = {
      //   //           ...state.items[index], ...model
      //   //         }
      //   //       }
      //   //     }),
      //   //   )
      //
      //   try {
      //       await queryFulfilled
      //   } catch (err) {
      //       patchResults.forEach(patchResults => {
      //         patchResults.undo()
      //       })
      //   }
      // },



      //

      // invalidatesTags: (_result, _error, {taskId}) =>
      //   [{type: 'Task', id: taskId}],
      invalidatesTags: (_result, _error, { todolistId }) => [{ type: "Task", id: todolistId }],
    }),
  }),
})

export const { useGetTasksQuery, useAddTaskMutation, useRemoveTaskMutation, useUpdateTaskMutation } = tasksApi

export const _tasksApi = {
  getTasks(todolistId: string) {
    return instance.get<GetTasksResponse>(`/todo-lists/${todolistId}/tasks`)
  },
  createTask(payload: { todolistId: string; title: string }) {
    const { todolistId, title } = payload
    return instance.post<BaseResponse<{ item: DomainTask }>>(`/todo-lists/${todolistId}/tasks`, { title })
  },
  updateTask(payload: { todolistId: string; taskId: string; model: UpdateTaskModel }) {
    const { todolistId, taskId, model } = payload
    return instance.put<BaseResponse<{ item: DomainTask }>>(`/todo-lists/${todolistId}/tasks/${taskId}`, model)
  },
  deleteTask(payload: { todolistId: string; taskId: string }) {
    const { todolistId, taskId } = payload
    return instance.delete<BaseResponse>(`/todo-lists/${todolistId}/tasks/${taskId}`)
  },
}
