'use strict'

import type * as Modem from 'docker-modem'

/**
 * Class representing a node
 */
export class Node {
  modem: Modem
  id: string
  data: Record<string, unknown> = {}

  /**
   * Create a node
   * @param  {Modem}      modem     Modem to connect to the remote service
   * @param  {string}     id        Id of the node (optional)
   */
  constructor (modem: Modem, id: string) {
    this.modem = modem
    this.id = id
  }

  /**
   * Update a node
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/update-a-node
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @return {Promise}        Promise return the new node
   */
  async update (opts?: Record<string, unknown>): Promise<Node> {
    const call = {
      path: `/nodes/${this.id}/update?`,
      method: 'POST',
      options: opts,
      statusCodes: {
        200: true,
        404: 'no such node',
        500: 'server error'
      }
    }

    return await new Promise((resolve, reject) => {
      this.modem.dial(call, (err, conf) => {
        if (err) { reject(err); return }
        const node = new Node(this.modem, this.id)
        node.data = conf
        resolve(node)
      })
    })
  }

  /**
   * Get low-level information on a node
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/inspect-a-node
   * The reason why this module isn't called inspect is because that interferes with the inspect utility of node.
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @return {Promise}        Promise return the node
   */
  async status (opts?: Record<string, unknown>): Promise<Node> {
    const call = {
      path: `/nodes/${this.id}?`,
      method: 'GET',
      options: opts,
      statusCodes: {
        200: true,
        404: 'no such node',
        500: 'server error'
      }
    }

    return await new Promise((resolve, reject) => {
      this.modem.dial(call, (err, conf) => {
        if (err) { reject(err); return }
        const node = new Node(this.modem, this.id)
        node.data = conf
        resolve(node)
      })
    })
  }

  /**
   * Remove a node
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/remove-a-node
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @return {Promise}        Promise return the result
   */
  async remove (opts: Record<string, unknown>): Promise<Record<string, unknown>> {
    const call = {
      path: `/nodes/${this.id}?`,
      method: 'DELETE',
      options: opts,
      statusCodes: {
        204: true,
        404: 'no such node',
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
   * Create a node
   * @param  {Modem}      modem     Modem to connect to the remote service
   */
  constructor (modem: Modem) {
    this.modem = modem
  }

  /**
   * Get a Node  Record<string, unknown>
   * @param  {id}         string    ID of the secret
   * @return {Node}
   */
  get (id: string): Node {
    return new Node(this.modem, id)
  }

  /**
   * Get the list of nodes
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/list-nodes
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @return {Promise}        Promise returning the result as a list of nodes
   */
  async list (opts?: Record<string, unknown>): Promise<Node[]> {
    const call = {
      path: '/nodes?',
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
          const node = new Node(this.modem, conf.ID)
          node.data = conf
          return node
        }))
      })
    })
  }
}