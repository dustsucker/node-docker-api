'use strict'

import type * as Modem from 'docker-modem'
import type * as fs from 'fs'
import { type Stream, type Readable } from 'stream'

import { Image } from './image'

/**
 * Class representing container execution
 */

export class Exec {
  modem: Modem
  container: Container
  id: string
  data: Record<string, unknown> = {}

  /**
   * Create an execution
   * @param  {Modem}      modem     Modem to connect to the remote service
   * @param  {Container}  container Container that owns the execution (optional)
   * @param  {string}     id        Id of the execution
   */

  constructor (modem: Modem, container: Container, id: string) {
    this.modem = modem
    this.container = container
    this.id = id
  }

  /**
   * Create an exec instance in a container
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/create-a-container
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @return {Promise}        Promise return the new exec instance
   */
  async create (opts?: Record<string, unknown>): Promise<Exec> {
    const call = {
      path: `/containers/${this.container.id}/exec?`,
      method: 'POST',
      options: opts,
      statusCodes: {
        200: true,
        201: true,
        404: 'no such container',
        409: 'container is paused',
        500: 'server error'
      }
    }

    return await new Promise((resolve, reject) => {
      this.modem.dial(call, (err, conf) => {
        if (err) { reject(err); return }
        const exec = new Exec(this.modem, this.container, conf.Id)
        exec.data = conf
        resolve(exec)
      })
    })
  }

  /**
   * Start an exec instance
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/exec-start
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @return {Promise}        Promise return the stream to the execution
   */
  async start (opts: any = {}): Promise<Stream> {
    const call = {
      path: `/exec/${this.id}/start?`,
      method: 'POST',
      options: opts,
      isStream: true,
      hijack: opts.hijack,
      openStdin: opts.stdin,
      statusCodes: {
        200: true,
        404: 'no such exec instance',
        409: 'container is paused'
      }
    }

    return await new Promise((resolve, reject) => {
      this.modem.dial(call, (err, stream: Stream) => {
        if (err) { reject(err); return }
        resolve(stream)
      })
    })
  }

  /**
   * Resize an exec instance
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/exec-resize
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @return {Promise}        Promise return the result
   */
  async resize (opts?: Record<string, unknown>): Promise<Record<string, unknown>> {
    const call = {
      path: `/exec/${this.id}/resize?`,
      method: 'POST',
      options: opts,
      statusCodes: {
        201: true,
        404: 'no such exec instance'
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
   * Get status of an exec instance
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/exec-inspect
   * The reason why this module isn't called inspect is because that interferes with the inspect utility of node.
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @return {Promise}        Promise return the exec instance
   */
  async status (opts?: Record<string, unknown>): Promise<Exec> {
    const call = {
      path: `/exec/${this.id}/json?`,
      method: 'GET',
      options: opts,
      statusCodes: {
        200: true,
        404: 'no such exec instance',
        500: 'server error'
      }
    }

    return await new Promise((resolve, reject) => {
      this.modem.dial(call, (err, conf) => {
        if (err) { reject(err); return }
        const exec = new Exec(this.modem, this.container, conf.Id)
        exec.data = conf
        resolve(exec)
      })
    })
  }
}

/**
 * Class representing container execution management
 */
export class ExecManager {
  modem: Modem
  container: Container

  /**
   * Create an execution
   * @param  {Modem}      modem     Modem to connect to the remote service
   * @param  {Container}  container Container that owns the execution (optional)
   * @param  {string}     id        Id of the execution
   */

  constructor (modem: Modem, container: Container) {
    this.modem = modem
    this.container = container
  }

  /**
   * Get a Exec  Record<string, unknown>
   * @param  {id}         string    ID of the exec
   * @return {Exec}
   */
  get (id: string): Exec {
    return new Exec(this.modem, this.container, id)
  }

  /**
   * Create an exec instance in a container
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/create-a-container
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @return {Promise}        Promise return the new exec instance
   */
  async create (opts?: Record<string, unknown>): Promise<Exec> {
    const call = {
      path: `/containers/${this.container.id}/exec?`,
      method: 'POST',
      options: opts,
      statusCodes: {
        200: true,
        201: true,
        404: 'no such container',
        409: 'container is paused',
        500: 'server error'
      }
    }

    return await new Promise((resolve, reject) => {
      this.modem.dial(call, (err, conf) => {
        if (err) { reject(err); return }
        const exec = new Exec(this.modem, this.container, conf.Id)
        exec.data = conf
        resolve(exec)
      })
    })
  }
}

/**
 * Class representing container filesystem
 */
export class ContainerFs {
  modem: Modem
  container: Container

  /**
   * Create an container filesystem  Record<string, unknown>
   * @param  {Modem}      modem     Modem to connect to the remote service
   * @param  {Container}  container Container that owns the filesystem (optional)
   */
  constructor (modem: Modem, container: Container) {
    this.modem = modem
    this.container = container
  }

  /**
   * Get the info about the filesystem of the container
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/retrieving-information-about-files-and-folders-in-a-container
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @return {Promise}        Promise returning the info about the filesystem
   */
  async info (opts?: Record<string, unknown>): Promise<string> {
    const call = {
      path: `/containers/${this.container.id}/archive?`,
      method: 'HEAD',
      isStream: true,
      options: opts,
      statusCodes: {
        200: true,
        404: 'bad request',
        500: 'server error'
      }
    }

    return await new Promise((resolve, reject) => {
      this.modem.dial(call, (err, info: string) => {
        if (err) { reject(err); return }
        resolve(info)
      })
    })
  }

  /**
   * Get a tar archive of a resource in the filesystem of a container
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/get-an-archive-of-a-filesystem-resource-in-a-container
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @return {Promise}        Promise returning the result as a stream to the tar file
   */
  async get (opts: any = {}): Promise<Stream> {
    const call = {
      path: `/containers/${this.container.id}/archive?path=${opts.path}&`,
      method: 'GET',
      isStream: true,
      options: opts,
      statusCodes: {
        200: true,
        400: 'bad request',
        404: 'no such container',
        500: 'server error'
      }
    }

    return await new Promise((resolve, reject) => {
      this.modem.dial(call, (err, stream: Stream) => {
        if (err) { reject(err); return }
        resolve(stream)
      })
    })
  }

  /**
   * Put an extracted tar archive in the filesystem of a container
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/extract-an-archive-of-files-or-folders-to-a-directory-in-a-container
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @return {Promise}        Promise returning the result
   */
  async put (file: fs.ReadStream, opts?: Record<string, unknown>): Promise< Record<string, unknown>> {
    const call = {
      path: `/containers/${this.container.id}/archive?`,
      method: 'PUT',
      options: opts,
      isStream: true,
      file,
      statusCodes: {
        200: true,
        400: 'bad request',
        403: 'permission denied',
        404: 'no such container',
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

/**
 * Class representing a container
 */
export class Container {
  modem: Modem
  id: string
  fs: ContainerFs
  exec: ExecManager
  Warnings: string[] = []
  data: {
    Id: string
    Names: string[]
    Image: string
    ImageID: string
    Command: string
    Created: number
    Ports: number[]
    Labels: any
    State: 'running' | 'exited'
    Status: string
    HostConfig: any
    NetworkSettings: any
    Mounts: any[]
  }

  /**
   * Create an container  Record<string, unknown>
   * @param  {Modem}  modem Modem to connect to the remote service
   * @param  {string} id    Container id
   */
  constructor (modem: Modem, id: string) {
    this.modem = modem
    this.id = id
    this.fs = new ContainerFs(this.modem, this)
    this.exec = new ExecManager(this.modem, this)
  }

  /**
   * Get low-level information on a container
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/inspect-a-container
   * The reason why this module isn't called inspect is because that interferes with the inspect utility of node.
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @return {Promise}        Promise return the container
   */
  async status (opts?: Record<string, unknown>): Promise<Container> {
    const call = {
      path: `/containers/${this.id}/json?`,
      method: 'GET',
      options: opts,
      statusCodes: {
        200: true,
        404: 'no such container',
        500: 'server error'
      }
    }

    return await new Promise((resolve, reject) => {
      this.modem.dial(call, (err, conf) => {
        if (err) { reject(err); return }
        const container = new Container(this.modem, this.id)
        container.data = conf
        resolve(container)
      })
    })
  }

  /**
   * Get list of processes (ps) inside a container. Not supported in Windows.
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/list-processes-running-inside-a-container
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @return {Promise}        Promise return the list of processes
   */
  async top (opts?: Record<string, unknown>): Promise< Array<Record<string, unknown>>> {
    const call = {
      path: `/containers/${this.id}/top?`,
      method: 'GET',
      options: opts,
      statusCodes: {
        200: true,
        404: 'no such container',
        500: 'server error'
      }
    }

    return await new Promise((resolve, reject) => {
      this.modem.dial(call, (err, processes: Array<Record<string, unknown>>) => {
        if (err) { reject(err); return }
        resolve(processes)
      })
    })
  }

  /**
   * Get stdout and stderr logs from a container
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/get-container-logs
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @return {Promise}        Promise returning the concatenated logs
   */
  async logs (opts?: Record<string, unknown>): Promise<Readable> {
    const call = {
      path: `/containers/${this.id}/logs?`,
      method: 'GET',
      options: opts,
      isStream: true,
      statusCodes: {
        101: true,
        200: true,
        404: 'no such container',
        500: 'server error'
      }
    }

    return await new Promise((resolve, reject) => {
      this.modem.dial(call, (err, logs: Readable) => {
        if (err) { reject(err); return }
        resolve(logs)
      })
    })
  }

  /**
   * Get changes on a container's filesystem
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/inspect-changes-on-a-container-s-filesystem
   * @return {Promise}        Promise returning the changes
   */
  async changes (): Promise< Array<Record<string, unknown>>> {
    const call = {
      path: `/containers/${this.id}/changes?`,
      method: 'GET',
      options: {},
      statusCodes: {
        200: true,
        404: 'no such container',
        500: 'server error'
      }
    }

    return await new Promise((resolve, reject) => {
      this.modem.dial(call, (err, changes: Array<Record<string, unknown>>) => {
        if (err) { reject(err); return }
        resolve(changes)
      })
    })
  }

  /**
   * Export the content of a container
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/export-a-container
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @return {Promise}          Promise returning the content of the tar file as a stream or as a string
   */
  async export (opts: any = {}): Promise< Record<string, unknown>> {
    const call = {
      path: `/containers/${this.id}/export?`,
      method: 'GET',
      options: opts,
      isStream: !!opts.stream,
      statusCodes: {
        200: true,
        404: 'no such container',
        500: 'server error'
      }
    }

    return await new Promise((resolve, reject) => {
      this.modem.dial(call, (err, tarStream: any) => {
        if (err) { reject(err); return }
        if (!opts.stream) { resolve(tarStream); return }

        const res: any = []
        tarStream.on('data', (chunk) => {
          return res.push(chunk.toString())
        })

        tarStream.on('end', () => {
          resolve(res.join(''))
        })
      })
    })
  }

  /**
   * Get the stats of a container, either by a live stream or the current state
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/export-a-container
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @return {Promise}          Promise returning the stats, in a stream or string
   */
  async stats (opts?: Record<string, unknown>): Promise< Record<string, unknown>> {
    const call = {
      path: `/containers/${this.id}/stats?`,
      method: 'GET',
      options: opts,
      isStream: true,
      statusCodes: {
        200: true,
        404: 'no such container',
        500: 'server error'
      }
    }

    return await new Promise((resolve, reject) => {
      this.modem.dial(call, (err, stats: Record<string, unknown>) => {
        if (err) { reject(err); return }
        resolve(stats)
      })
    })
  }

  /**
   * Resize the TTY for a container. You must restart the container to make the resize take effect.
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/resize-a-container-tty
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @return {Promise}          Promise returning the response
   */
  async resize (opts?: Record<string, unknown>): Promise< Record<string, unknown>> {
    const call = {
      path: `/containers/${this.id}/resize?`,
      method: 'GET',
      options: opts,
      statusCodes: {
        200: true,
        404: 'no such container',
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
   * Start a container
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/start-a-container
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @return {Promise}          Promise returning the container
   */
  async start (opts: Record<string, unknown> = {}): Promise<Container> {
    const call = {
      path: `/containers/${this.id}/start?`,
      method: 'POST',
      options: opts,
      statusCodes: {
        204: true,
        304: true,
        404: 'no such container',
        500: 'server error'
      }
    }

    return await new Promise((resolve, reject) => {
      this.modem.dial(call, (err) => {
        if (err) { reject(err); return }
        resolve(this)
      })
    })
  }

  /**
   * Stop a container
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/stop-a-container
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @return {Promise}          Promise returning the container
   */
  async stop (opts?: Record<string, unknown>): Promise<Container> {
    const call = {
      path: `/containers/${this.id}/stop?`,
      method: 'POST',
      options: opts,
      statusCodes: {
        204: true,
        304: true,
        404: 'no such container',
        500: 'server error'
      }
    }

    return await new Promise((resolve, reject) => {
      this.modem.dial(call, (err) => {
        if (err) { reject(err); return }
        resolve(this)
      })
    })
  }

  /**
   * Restart a container
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/restart-a-container
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @return {Promise}          Promise returning the container
   */
  async restart (opts?: Record<string, unknown>): Promise<Container> {
    const call = {
      path: `/containers/${this.id}/restart?`,
      method: 'POST',
      options: opts,
      statusCodes: {
        204: true,
        404: 'no such container',
        500: 'server error'
      }
    }

    return await new Promise((resolve, reject) => {
      this.modem.dial(call, (err) => {
        if (err) { reject(err); return }
        resolve(this)
      })
    })
  }

  /**
   * Kill a container
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/kill-a-container
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @return {Promise}          Promise returning the container
   */
  async kill (opts?: Record<string, unknown>): Promise<Container> {
    const call = {
      path: `/containers/${this.id}/kill?`,
      method: 'POST',
      options: opts,
      statusCodes: {
        204: true,
        404: 'no such container',
        500: 'server error'
      }
    }

    return await new Promise((resolve, reject) => {
      this.modem.dial(call, (err) => {
        if (err) { reject(err); return }
        resolve(this)
      })
    })
  }

  /**
   * Update configuration a container.
   * Docs says you can do it for more than one, but doesn't exaplin how, so let's leave it in only one
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/update-a-container
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @return {Promise}          Promise returning the container
   */
  async update (opts?: Record<string, unknown>): Promise<Container> {
    const call = {
      path: `/containers/${this.id}/update?`,
      method: 'POST',
      options: opts,
      statusCodes: {
        200: true,
        400: 'bad request',
        404: 'no such container',
        500: 'server error'
      }
    }

    return await new Promise((resolve, reject) => {
      this.modem.dial(call, (err, warnings: string[]) => {
        const container = new Container(this.modem, this.id)
        container.Warnings = warnings
        if (err) { reject(err); return }
        resolve(container)
      })
    })
  }

  /**
   * Rename a container.
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/rename-a-container
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @return {Promise}          Promise returning the container
   */
  async rename (opts: Record<string, unknown>): Promise<Container> {
    const call = {
      path: `/containers/${this.id}/rename?`,
      method: 'POST',
      options: opts,
      statusCodes: {
        204: true,
        404: 'no such container',
        409: 'name already taken',
        500: 'server error'
      }
    }

    return await new Promise((resolve, reject) => {
      this.modem.dial(call, (err) => {
        if (err) { reject(err); return }
        resolve(this)
      })
    })
  }

  /**
   * Pause a container.
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/pause-a-container
   * @return {Promise}          Promise returning the container
   */
  async pause (): Promise<Container> {
    const call = {
      path: `/containers/${this.id}/pause?`,
      method: 'POST',
      options: {},
      statusCodes: {
        204: true,
        404: 'no such container',
        500: 'server error'
      }
    }

    return await new Promise((resolve, reject) => {
      this.modem.dial(call, (err) => {
        if (err) { reject(err); return }
        resolve(this)
      })
    })
  }

  /**
   * Unpause a container.
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/unpause-a-container
   * @return {Promise}          Promise returning the container
   */
  async unpause (): Promise<Container> {
    const call = {
      path: `/containers/${this.id}/unpause?`,
      method: 'POST',
      options: {},
      statusCodes: {
        204: true,
        404: 'no such container',
        500: 'server error'
      }
    }

    return await new Promise((resolve, reject) => {
      this.modem.dial(call, (err) => {
        if (err) { reject(err); return }
        resolve(this)
      })
    })
  }

  /**
   * Attach to a container.
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/attach-to-a-container
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @return {Promise}          Promise returning the container
   */
  async attach (opts: any = {}): Promise< Array<Record<string, unknown>>> {
    const call = {
      path: `/containers/${this.id}/attach?`,
      method: 'POST',
      isStream: true,
      openStdin: opts.stdin,
      options: opts,
      statusCodes: {
        101: true,
        200: true,
        400: 'bad request',
        404: 'no such container',
        500: 'server error'
      }
    }

    return await new Promise((resolve, reject) => {
      this.modem.dial(call, (err, stream) => {
        if (err) { reject(err); return }
        resolve([stream, this])
      })
    })
  }

  /**
   * Attach to a container using websocket.
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/attach-to-a-container-websocket
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @return {Promise}          Promise returning the stream and the container
   */
  async wsattach (opts?: Record<string, unknown>): Promise< Array<Record<string, unknown>>> {
    const call = {
      path: `/containers/${this.id}/attach/ws?`,
      method: 'GET',
      options: opts,
      statusCodes: {
        200: true,
        400: 'bad request',
        404: 'no such container',
        500: 'server error'
      }
    }

    return await new Promise((resolve, reject) => {
      this.modem.dial(call, (err, stream) => {
        if (err) { reject(err); return }
        resolve([stream, this])
      })
    })
  }

  /**
   * Block until a container stops, returning exit code
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/wait-a-container
   * @return {Promise}          Promise returning the exit code
   */
  async wait (): Promise<number> {
    const call = {
      path: `/containers/${this.id}/wait?`,
      method: 'POST',
      options: {},
      statusCodes: {
        200: true,
        404: 'no such container',
        500: 'server error'
      }
    }

    return await new Promise((resolve, reject) => {
      this.modem.dial(call, (err, code: number) => {
        if (err) { reject(err); return }
        resolve(code)
      })
    })
  }

  /**
   * Remove a container.
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/remove-a-container
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @return {Promise}          Promise returning nothing
   */
  async delete (opts?: Record<string, unknown>): Promise<Record<string, unknown>> {
    const call = {
      path: `/containers/${this.id}?`,
      method: 'DELETE',
      options: opts,
      statusCodes: {
        204: true,
        400: 'bad request',
        404: 'no such container',
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
   * Commit container into an image
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/create-a-new-image-from-a-container-s-changes
   * @param  { Record<string, unknown>}   opts    Query params in the request (optional)
   * @return {Promise}          Promise returning the new image
   */
  async commit (opts: any = {}): Promise<Image> {
    opts.container = this.id

    const call = {
      path: '/commit?',
      method: 'POST',
      options: opts,
      statusCodes: {
        201: true,
        404: 'no such container',
        500: 'server error'
      }
    }

    return await new Promise((resolve, reject) => {
      this.modem.dial(call, (err, res) => {
        if (err) { reject(err); return }
        resolve(new Image(this.modem, res.Id.replace('sha256:', '')))
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
   * Get a Container  Record<string, unknown>
   * @param  {id}         string    ID of the container
   * @return {Container}
   */
  get (id: string): Container {
    return new Container(this.modem, id)
  }

  /**
   * Get the list of containers
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/list-containers
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @return {Promise}        Promise returning the result as a list of containers
   */
  async list (opts?: Record<string, unknown>): Promise<Container[]> {
    const call = {
      path: '/containers/json?',
      method: 'GET',
      options: opts,
      statusCodes: {
        200: true,
        400: 'bad request',
        500: 'server error'
      }
    }

    return await new Promise((resolve, reject) => {
      this.modem.dial(call, (err, containers) => {
        if (err) { reject(err); return }
        resolve(containers.map((conf) => {
          const container = new Container(this.modem, conf.Id)
          container.data = conf
          return container
        }))
      })
    })
  }

  /**
   * Create a container
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/create-a-container
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @return {Promise}        Promise return the new container
   */
  async create (opts?: Record<string, unknown>): Promise<Container> {
    const call = {
      path: '/containers/create?',
      method: 'POST',
      options: opts,
      statusCodes: {
        200: true,
        201: true,
        400: 'bad request',
        404: 'no such image',
        406: 'impossible to attach',
        500: 'server error'
      }
    }

    return await new Promise((resolve, reject) => {
      this.modem.dial(call, (err, conf) => {
        if (err) { reject(err); return }
        const container = new Container(this.modem, conf.Id)
        container.data = conf
        resolve(container)
      })
    })
  }

  /**
   * Prune a container
   * https://docs.docker.com/engine/api/v1.25/#operation/ContainerPrune
   * @param  { Record<string, unknown>}   opts  Query params in the request (optional)
   * @return {Promise}          Promise returning the container
   */
  async prune (opts?: Record<string, unknown>): Promise< Record<string, unknown>> {
    const call = {
      path: '/containers/prune',
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