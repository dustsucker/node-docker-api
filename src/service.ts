'use strict'

import type * as Modem from 'docker-modem'

/**
 * Class representing a service
 */
export class Service {
  modem: Modem
  id: string
  data: Record<string, unknown> = {}

  /**
   * Create a service
   * @param  {Modem}      modem     Modem to connect to the remote service
   * @param  {string}     id        Id of the service (optional)
   */
  constructor (modem: Modem, id: string) {
    this.modem = modem
    this.id = id
  }

  /**
   * Update a service
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/update-a-service
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @param  { Record<string, unknown>}   auth  Authentication (optional)
   * @return {Promise}        Promise return the new service
   */
  async update (opts?: Record<string, unknown>, auth?: Record<string, unknown>): Promise<Service> {
    const call = {
      path: `/services/${this.id}/update?`,
      method: 'POST',
      options: opts,
      authconfig: auth,
      statusCodes: {
        200: true,
        404: 'no such service',
        500: 'server error'
      }
    }

    return await new Promise((resolve, reject) => {
      this.modem.dial(call, (err, conf) => {
        if (err) { reject(err); return }
        const service = new Service(this.modem, this.id)
        service.data = conf
        resolve(service)
      })
    })
  }

  /**
   * Get low-level information on a service
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/inspect-one-or-more-services
   * The reason why this module isn't called inspect is because that interferes with the inspect utility of service.
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @return {Promise}        Promise return the service
   */
  async status (opts?: Record<string, unknown>): Promise<Service> {
    const call = {
      path: `/services/${this.id}?`,
      method: 'GET',
      options: opts,
      statusCodes: {
        200: true,
        404: 'no such service',
        500: 'server error'
      }
    }

    return await new Promise((resolve, reject) => {
      this.modem.dial(call, (err, conf) => {
        if (err) { reject(err); return }
        const service = new Service(this.modem, this.id)
        service.data = conf
        resolve(service)
      })
    })
  }

  /**
   * Remove a service
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/remove-a-service
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @return {Promise}        Promise return the result
   */
  async remove (opts?: Record<string, unknown>): Promise<string> {
    const call = {
      path: `/services/${this.id}?`,
      method: 'DELETE',
      options: opts,
      statusCodes: {
        200: true,
        404: 'no such service',
        500: 'server error'
      }
    }

    return await new Promise((resolve, reject) => {
      this.modem.dial(call, (err, res: string) => {
        if (err) { reject(err); return }
        resolve(res)
      })
    })
  }

  /**
   * Logs of a service
   * https://docs.docker.com/engine/api/v1.27/#operation/ServiceLogs
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @return {Promise}        Promise return the result
   */
  async logs (opts?: Record<string, unknown>): Promise<string> {
    const call = {
      path: `/services/${this.id}/logs?`,
      method: 'GET',
      options: opts,
      isStream: true,
      statusCodes: {
        101: true,
        200: true,
        404: 'no such service',
        500: 'server error',
        501: 'use --experimental to see this',
        503: 'node is not part of a swarm'
      }
    }

    return await new Promise((resolve, reject) => {
      this.modem.dial(call, (err, logs) => {
        if (err) { reject(err); return }
        resolve(logs)
      })
    })
  }
}

export default class {
  modem: Modem

  /**
   * Create a service
   * @param  {Modem}      modem     Modem to connect to the remote service
   */
  constructor (modem: Modem) {
    this.modem = modem
  }

  /**
   * Get a Service  Record<string, unknown>
   * @param  {id}         string    ID of the secret
   * @return {Network}
   */
  get (id: string): Service {
    return new Service(this.modem, id)
  }

  /**
   * Create a service
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/create-a-service
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @param  { Record<string, unknown>}   auth  Authentication (optional)
   * @return {Promise}        Promise return the new service
   */
  async create (opts?: Record<string, unknown>, auth?: Record<string, unknown>): Promise<Service> {
    const call = {
      path: '/services/create?',
      method: 'POST',
      options: opts,
      authconfig: auth,
      statusCodes: {
        201: true,
        406: 'node is not part of a swarm',
        409: 'name conflicts'
      }
    }

    return await new Promise((resolve, reject) => {
      this.modem.dial(call, (err, conf) => {
        if (err) { reject(err); return }
        const service = new Service(this.modem, conf.ID)
        service.data = conf
        resolve(service)
      })
    })
  }

  /**
   * Get the list of services
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/list-services
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @return {Promise}        Promise returning the result as a list of services
   */
  async list (opts?: Record<string, unknown>): Promise<Service[]> {
    const call = {
      path: '/services?',
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
        resolve(result.map((conf) => {
          const service = new Service(this.modem, conf.ID)
          service.data = conf
          return service
        }))
      })
    })
  }
}