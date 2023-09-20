'use strict'

import * as Modem from 'docker-modem'
import ContainerManager from './container'
import ImageManager from './image'
import VolumeManager from './volume'
import NetworkManager from './network'
import NodeManager from './node'
import PluginManager from './plugin'
import SecretManager from './secret'
import ServiceManager from './service'
import SwarmManager from './swarm'
import TaskManager from './task'

/**
 * Docker class with all methods
 */
export class Docker {
  modem: Modem
  container: ContainerManager
  image: ImageManager
  volume: VolumeManager
  network: NetworkManager
  node: NodeManager
  plugin: PluginManager
  secret: SecretManager
  service: ServiceManager
  swarm: SwarmManager
  task: TaskManager

  /**
   * Creates the Docker  Record<string, unknown>
   * @param { Record<string, unknown>}  opts Docker options
   */
  constructor (opts) {
    this.modem = new Modem(opts)

    this.container = new ContainerManager(this.modem)
    this.image = new ImageManager(this.modem)
    this.volume = new VolumeManager(this.modem)
    this.network = new NetworkManager(this.modem)
    this.node = new NodeManager(this.modem)
    this.plugin = new PluginManager(this.modem)
    this.secret = new SecretManager(this.modem)
    this.service = new ServiceManager(this.modem)
    this.swarm = new SwarmManager(this.modem)
    this.task = new TaskManager(this.modem)
  }

  /**
   * Validate credentials for a registry and get identity token,
   * if available, for accessing the registry without password
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/check-auth-configuration
   * @param  { Record<string, unknown>}   opts  Auth options
   * @return {Promise}        Promise returning the result
   */
  async auth (opts: Record<string, unknown>): Promise< Record<string, unknown>> {
    const call = {
      path: '/auth?',
      method: 'POST',
      options: opts,
      statusCodes: {
        200: true,
        204: true,
        500: 'server error'
      }
    }

    return await new Promise((resolve, reject) => {
      this.modem.dial(call, (err, data: Record<string, unknown>) => {
        if (err) { reject(err); return }
        resolve(data)
      })
    })
  }

  /**
   * Get system wide information about docker
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/display-system-wide-information
   * @return {Promise}        Promise returning the result
   */
  async info (): Promise< Record<string, unknown>> {
    const call = {
      path: '/info?',
      method: 'GET',
      statusCodes: {
        200: true,
        500: 'server error'
      }
    }

    return await new Promise((resolve, reject) => {
      this.modem.dial(call, (err, data: Record<string, unknown>) => {
        if (err) { reject(err); return }
        resolve(data)
      })
    })
  }

  /**
   * Get docker version information of server
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/show-the-docker-version-information
   * @return {Promise}        Promise returning the result
   */
  async version (): Promise< Record<string, unknown>> {
    const call = {
      path: '/version?',
      method: 'GET',
      statusCodes: {
        200: true,
        500: 'server error'
      }
    }

    return await new Promise((resolve, reject) => {
      this.modem.dial(call, (err, data) => {
        if (err) { reject(err); return }
        resolve(data)
      })
    })
  }

  /**
   * Ping the docker server
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/ping-the-docker-server
   * @return {Promise}        Promise returning the result
   */
  async ping (): Promise<string> {
    const call = {
      path: '/_ping?',
      method: 'GET',
      statusCodes: {
        200: true,
        500: 'server error'
      }
    }

    return await new Promise((resolve, reject) => {
      this.modem.dial(call, (err, data: string) => {
        if (err) { reject(err); return }
        resolve(data)
      })
    })
  }

  /**
   * Get container events from docker, can be in real time via streaming or via polling (with since)
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/monitor-docker-s-events
   * @param  { Record<string, unknown>}   opts  Options to send with the request (optional)
   * @return {Promise}        Promise returning the result
   */
  async events (opts: Record<string, unknown> = {}): Promise< Record<string, unknown>> {
    const call = {
      path: '/events?',
      method: 'GET',
      options: opts,
      isStream: true,
      statusCodes: {
        200: true,
        500: 'server error'
      }
    }

    return await new Promise((resolve, reject) => {
      this.modem.dial(call, (err, data: Record<string, unknown>) => {
        if (err) { reject(err); return }
        resolve(data)
      })
    })
  }
}