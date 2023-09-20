'use strict'

import type * as Modem from 'docker-modem'

/**
 * Class representing a task
 */
export class Task {
  modem: Modem
  id: string
  data: Record<string, unknown> = {}

  /**
   * Create a task
   * @param  {Modem}      modem     Modem to connect to the remote service
   * @param  {string}     id        Id of the task (optional)
   */
  constructor (modem: Modem, id: string) {
    this.modem = modem
    this.id = id
  }

  /**
   * Get low-level information on a task
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/inspect-a-task
   * The reason why this module isn't called inspect is because that interferes with the inspect utility of task.
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @param  {String}   id    ID of the task to inspect, if it's not set, use the id of the  Record<string, unknown> (optional)
   * @return {Promise}        Promise return the task
   */
  async status (opts?: Record<string, unknown>): Promise<any> {
    const call = {
      path: `/tasks/${this.id}?`,
      method: 'GET',
      options: opts,
      statusCodes: {
        200: true,
        404: 'no such task',
        500: 'server error'
      }
    }

    return await new Promise((resolve, reject) => {
      this.modem.dial(call, (err, conf) => {
        if (err) { reject(err); return }
        const task = new Task(this.modem, this.id)
        task.data = conf
        resolve(task)
      })
    })
  }
}

export default class {
  modem: Modem

  /**
   * Create a task
   * @param  {Modem}      modem     Modem to connect to the remote service
   * @param  {string}     id        Id of the task (optional)
   */
  constructor (modem: Modem) {
    this.modem = modem
  }

  /**
   * Get a Task  Record<string, unknown>
   * @param  {id}         string    ID of the secret
   * @return {Task}
   */
  get (id: string): Task {
    return new Task(this.modem, id)
  }

  /**
   * Get the list of tasks
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/list-tasks
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @return {Promise}        Promise returning the result as a list of tasks
   */
  async list (opts?: Record<string, unknown>): Promise<Task[]> {
    const call = {
      path: '/tasks?',
      method: 'GET',
      options: opts,
      statusCodes: {
        200: true,
        500: 'server error'
      }
    }

    return await new Promise((resolve, reject) => {
      this.modem.dial(call, (err, result) => {
        if (err) { reject(err); return }
        if (!result?.length) { resolve([]); return }
        resolve(result.map((conf) => {
          const task = new Task(this.modem, conf.ID)
          task.data = conf
          return task
        }))
      })
    })
  }
}