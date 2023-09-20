'use strict'

import type * as Modem from 'docker-modem'

/**
 * Class representing a volume
 */
export class Volume {
  modem: Modem
  id: string
  data: Record<string, unknown> = {}

  /**
   * Create a volume
   * @param  {Modem}      modem     Modem to connect to the remote service
   * @param  {string}     id        Id of the volume (optional)
   */
  constructor (modem: Modem, id: string) {
    this.modem = modem
    this.id = id
  }

  /**
   * Get low-level information on a volume
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/inspect-a-volume
   * The reason why this module isn't called inspect is because that interferes with the inspect utility of node.
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @param  {String}   id    ID of the volume to inspect, if it's not set, use the id of the  Record<string, unknown> (optional)
   * @return {Promise}        Promise return the volume
   */
  async status (opts?: Record<string, unknown>): Promise<Volume> {
    const call = {
      path: `/volumes/${this.id}?`,
      method: 'GET',
      options: opts,
      statusCodes: {
        200: true,
        404: 'no such volume',
        500: 'server error'
      }
    }

    return await new Promise((resolve, reject) => {
      this.modem.dial(call, (err, conf) => {
        if (err) { reject(err); return }
        const volume = new Volume(this.modem, this.id)
        volume.data = conf
        resolve(volume)
      })
    })
  }

  /**
   * Remove a volume from the filesystem
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/remove-a-volume
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @param  {String}   id    ID of the volume to inspect, if it's not set, use the id of the  Record<string, unknown> (optional)
   * @return {Promise}        Promise return the result
   */
  async remove (opts?: Record<string, unknown>): Promise<Record<string, unknown>> {
    const call = {
      path: `/volumes/${this.id}?`,
      method: 'DELETE',
      options: opts,
      statusCodes: {
        204: true,
        404: 'no such volume',
        409: 'conflict',
        500: 'server error'
      }
    }

    return await new Promise((resolve, reject) => {
      this.modem.dial(call, (err, res: Record<string, unknown>) => {
        if (err) { reject(err); return }
        resolve(res)
      })
    })
  }
}

export default class {
  modem: Modem

  /**
   * Create a volume
   * @param  {Modem}      modem     Modem to connect to the remote service
   * @param  {string}     id        Id of the volume (optional)
   */
  constructor (modem: Modem) {
    this.modem = modem
  }

  /**
   * Get a Volume  Record<string, unknown>
   * @param  {id}         String    ID of the secret
   * @return {Volume}
   */
  get (id: string): Volume {
    return new Volume(this.modem, id)
  }

  /**
   * Get the list of volumes
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/list-volumes
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @return {Promise}        Promise returning the result as a list of volumes
   */
  async list (opts?: Record<string, unknown>): Promise<Volume[]> {
    const call = {
      path: '/volumes',
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
        if (!result.Volumes?.length) { resolve([]); return }
        resolve(result.Volumes.map((conf) => {
          const volume = new Volume(this.modem, conf.Name)
          volume.data = conf
          return volume
        }))
      })
    })
  }

  /**
   * Create a volume
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/create-a-volume
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @return {Promise}        Promise return the new volume
   */
  async create (opts?: Record<string, unknown>): Promise<Volume> {
    const call = {
      path: '/volumes/create?',
      method: 'POST',
      options: opts,
      statusCodes: {
        201: true,
        500: 'server error'
      }
    }

    return await new Promise((resolve, reject) => {
      this.modem.dial(call, (err, conf) => {
        if (err) { reject(err); return }
        const volume = new Volume(this.modem, conf.Name)
        resolve(volume)
      })
    })
  }

  /**
   * Prune volumes
   * https://docs.docker.com/engine/api/v1.25/#operation/VolumePrune
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @return {Promise}          Promise returning the container
   */
  async prune (opts?: Record<string, unknown>): Promise< Record<string, unknown>> {
    const call = {
      path: '/volumes/prune',
      method: 'POST',
      options: opts,
      statusCodes: {
        200: true,
        500: 'server error'
      }
    }

    return await new Promise((resolve, reject) => {
      this.modem.dial(call, (err, res: Record<string, unknown>) => {
        if (err) { reject(err); return }
        resolve(res)
      })
    })
  }
}