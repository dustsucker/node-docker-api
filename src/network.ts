'use strict'

import type * as Modem from 'docker-modem'

/**
 * Class reprensenting a network
 */
export class Network {
  modem: Modem
  id: string
  data: Record<string, unknown> = {}

  /**
   * Creates a new network
   * @param  {Modem}      modem     Modem to connect to the remote service
   * @param  {string}     id        Id of the network (optional)
   */
  constructor (modem: Modem, id: string) {
    this.modem = modem
    this.id = id
  }

  /**
   * Get low-level information on a network
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/inspect-network
   * The reason why this module isn't called inspect is because that interferes with the inspect utility of node.
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @return {Promise}        Promise return the network
   */
  async status (opts?: Record<string, unknown>): Promise<Network> {
    const call = {
      path: `/networks/${this.id}?`,
      method: 'GET',
      options: opts,
      statusCodes: {
        200: true,
        404: 'no such network',
        500: 'server error'
      }
    }

    return await new Promise((resolve, reject) => {
      this.modem.dial(call, (err, conf) => {
        if (err) { reject(err); return }
        const network = new Network(this.modem, this.id)
        network.data = conf
        resolve(network)
      })
    })
  }

  /**
   * Remove a network
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/remove-a-network
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @return {Promise}        Promise return the result
   */
  async remove (opts?: Record<string, unknown>): Promise<Record<string, unknown>> {
    const call = {
      path: `/networks/${this.id}?`,
      method: 'DELETE',
      options: opts,
      statusCodes: {
        204: true,
        404: 'no such network',
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

  /**
   * Connect a container into the network
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/connect-a-container-to-a-network
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @return {Promise}        Promise return the network
   */
  async connect (opts?: Record<string, unknown>): Promise<Network> {
    const call = {
      path: `/networks/${this.id}/connect?`,
      method: 'POST',
      options: opts,
      statusCodes: {
        200: true,
        403: 'operation not supported for swarm scoped network',
        404: 'network or container not found',
        500: 'server error'
      }
    }

    return await new Promise((resolve, reject) => {
      this.modem.dial(call, (err, conf) => {
        if (err) { reject(err); return }
        const network = new Network(this.modem, this.id)
        network.data = conf
        resolve(network)
      })
    })
  }

  /**
   * Disonnect a container into the network
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/disconnect-a-container-from-a-network
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @return {Promise}        Promise return the network
   */
  async disconnect (opts?: Record<string, unknown>): Promise<Network> {
    const call = {
      path: `/networks/${this.id}/disconnect?`,
      method: 'POST',
      options: opts,
      statusCodes: {
        200: true,
        403: 'operation not supported for swarm scoped network',
        404: 'network or container not found',
        500: 'server error'
      }
    }

    return await new Promise((resolve, reject) => {
      this.modem.dial(call, (err, conf) => {
        if (err) { reject(err); return }
        const network = new Network(this.modem, this.id)
        network.data = conf
        resolve(network)
      })
    })
  }
}

export default class {
  modem: Modem

  constructor (modem: Modem) {
    this.modem = modem
  }

  /**
   * Get a Network  Record<string, unknown>
   * @param  {id}         string    ID of the secret
   * @return {Network}
   */
  get (id: string): Network {
    return new Network(this.modem, id)
  }

  /**
   * Get the list of networks
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/list-networks
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @return {Promise}        Promise returning the result as a list of networks
   */
  async list (opts?: Record<string, unknown>): Promise<Network[]> {
    const call = {
      path: '/networks?',
      method: 'GET',
      options: opts,
      statusCodes: {
        200: true,
        500: 'server error'
      }
    }

    return await new Promise((resolve, reject) => {
      this.modem.dial(call, (err, networks) => {
        if (err) { reject(err); return }
        if (!networks?.length) { resolve([]); return }
        resolve(networks.map((conf) => {
          const network = new Network(this.modem, conf.Id)
          network.data = conf
          return network
        }))
      })
    })
  }

  /**
   * Create a network
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/create-a-network
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @return {Promise}        Promise return the new network
   */
  async create (opts?: Record<string, unknown>): Promise<Network> {
    const call = {
      path: '/networks/create?',
      method: 'POST',
      options: opts,
      statusCodes: {
        201: true,
        404: 'plugin not found',
        500: 'server error'
      }
    }

    return await new Promise((resolve, reject) => {
      this.modem.dial(call, (err, conf) => {
        if (err) { reject(err); return }
        const network = new Network(this.modem, conf.Id)
        network.data = conf
        resolve(network)
      })
    })
  }

  /**
   * Prune network
   * https://docs.docker.com/engine/api/v1.25/#operation/NetworkPrune
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @return {Promise}          Promise returning the container
   */
  async prune (opts?: Record<string, unknown>): Promise<Record<string, unknown>> {
    const call = {
      path: '/networks/prune',
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