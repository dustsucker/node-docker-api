'use strict'

import type * as Modem from 'docker-modem'

/**
 * Class representing a secret
 */
export class Secret {
  modem: Modem
  id: string
  data: Record<string, unknown> = {}

  /**
   * Create a secret
   * @param  {Modem}      modem     Modem to connect to the remote service
   * @param  {string}     id        Id of the secret (optional)
   */
  constructor (modem: Modem, id: string) {
    this.modem = modem
    this.id = id
  }

  /**
   * Get low-level information on a secret
   * https://docs.docker.com/engine/api/v1.25/#operation/SecretInspect
   * The reason why this module isn't called inspect is because that interferes with the inspect utility of node.
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @return {Promise}        Promise return the secret
   */
  async status (opts?: Record<string, unknown>): Promise<Secret> {
    const call = {
      path: `/secrets/${this.id}?`,
      method: 'GET',
      options: opts,
      statusCodes: {
        200: true,
        404: 'no such secret',
        406: '406 node is not part of a swarm',
        500: 'server error'
      }
    }

    return await new Promise((resolve, reject) => {
      this.modem.dial(call, (err, conf) => {
        if (err) { reject(err); return }
        const secret = new Secret(this.modem, this.id)
        secret.data = conf
        resolve(secret)
      })
    })
  }

  /**
   * Remove a secret
   * https://docs.docker.com/engine/api/v1.25/#operation/SecretDelete
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @return {Promise}        Promise return the result
   */
  async remove (opts?: Record<string, unknown>): Promise<Record<string, unknown>> {
    const call = {
      path: `/secrets/${this.id}?`,
      method: 'DELETE',
      options: opts,
      statusCodes: {
        204: true,
        404: 'no such secret',
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
   * Create a secret
   * @param  {Modem}      modem     Modem to connect to the remote service
   */
  constructor (modem: Modem) {
    this.modem = modem
  }

  /**
   * Get a Secret  Record<string, unknown>
   * @param  {id}         string    ID of the secret
   * @return {Secret}
   */
  get (id: string): Secret {
    return new Secret(this.modem, id)
  }

  /**
   * Get the list of secrets
   * https://docs.docker.com/engine/api/v1.25/#operation/SecretList
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @return {Promise}        Promise returning the result as a list of secrets
   */
  async list (opts?: Record<string, unknown>): Promise<Secret[]> {
    const call = {
      path: '/secrets',
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
        if (!result.length) { resolve([]); return }
        resolve(result.map((conf) => {
          const secret = new Secret(this.modem, conf.Name)
          secret.data = conf
          return secret
        }))
      })
    })
  }

  /**
   * Create a secret
   * https://docs.docker.com/engine/api/v1.25/#operation/SecretCreate
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @return {Promise}        Promise return the new secret
   */
  async create (opts?: Record<string, unknown>): Promise<Secret> {
    const call = {
      path: '/secrets/create?',
      method: 'POST',
      options: opts,
      statusCodes: {
        201: true,
        406: 'server error or node is not part of a swarm',
        409: '409 name conflicts with an existing  Record<string, unknown>',
        500: 'server error'
      }
    }

    return await new Promise((resolve, reject) => {
      this.modem.dial(call, (err, conf) => {
        if (err) { reject(err); return }
        const secret = new Secret(this.modem, conf.ID)
        secret.data = conf
        resolve(secret)
      })
    })
  }
}