declare namespace PIXI {
    export module particles {
        export class AnimatedParticle extends Particle { }
        export interface EmitterInitConfig {
            "alpha"?: {
                "start": number,
                "end": number
            },
            "scale"?: {
                "start": number,
                "end": number,
                "minimumScaleMultiplier"?: number
            },
            "color"?: {
                "start": string,
                "end": string
            },
            "speed"?: {
                "start": number,
                "end": number
            },
            "acceleration"?: {
                "x": number,
                "y": number
            },
            "startRotation"?: {
                "min": number,
                "max": number
            },
            "noRotation"?: boolean,
            "rotationSpeed"?: {
                "min": number,
                "max": number
            },
            "lifetime": {
                "min": number,
                "max": number
            },
            "blendMode"?: string,//of PIXI.BLEND_MODES
            "frequency": number,
            "emitterLifetime": number,
            "maxParticles": number,
            "pos": {
                "x": number,
                "y": number
            },
            "addAtBack": boolean,
            "spawnType": string,
            "spawnCircle"?: {
                "x": number,
                "y": number,
                "r": number
            },
            "spawnRect"?: {
                "x": number,
                "y": number,
                "w": number,
                "h": number
            }
            ease?: Function
        }

        export class Emitter {
            constructor(particleParent: PIXI.Container, particleImages?: Array<PIXI.Texture> | Array<string> | PIXI.Texture | string, config?: EmitterInitConfig)
            /**Kills all active particles immediately.*/
            cleanup()

            /**Destroys the emitter and all of its particles.*/
            destroy()

            /**
             * Sets up the emitter based on the config settings.
             * @parame {art} A texture or array of textures to use for the particles.
             * @parame {config} A configuration object containing settings for the emitter.
             */
            init(art: Array<PIXI.Texture> | PIXI.Texture, config: EmitterInitConfig)

            /**
             * Recycles an individual particle.
             * particle Particle
             * The particle to recycle.
             */
            recycle(particle: Particle)

            /**Prevents emitter position interpolation in the next update. This should be used if you made a major position change of your emitter's owner that was not normal movement.*/
            resetPositionTracking()

            /**Sets the rotation of the emitter to a new value.
             * newRot Number
             * The new rotation, in degrees.
             */
            rotate(newRot)

            /** Updates all particles spawned by this emitter and emits new ones.
             * @parame {delta} Time elapsed since the previous frame, in seconds.
             */
            update(delta: number)

            /**Changes the position of the emitter's owner. You should call this if you are adding particles to the world display object that your emitter's owner is moving around in.
             * @params {x} The new x value of the emitter's owner.
             * @params {y} The new y value of the emitter's owner.
             */
            updateOwnerPos(x: number, y: number)

            /**Changes the spawn position of the emitter.
             * @params {x} The new x value of the spawn position for the emitter.
             * @params {y} The new y value of the spawn position for the emitter.
             */
            updateSpawnPos(x: number, y: number)
            /**If either ownerPos or spawnPos has changed since the previous update. */
            _posChanged: boolean
            /**Acceleration to apply to particles. Using this disables any interpolation of particle speed. If the particles do not have a rotation speed, then they will be rotated to match the direction of travel. */
            acceleration: PIXI.Point// = null

            /**If particles should be added at the back of the display list instead of the front. */
            addAtBack: boolean
            /**Angle at which to start spawning particles in a burst. */
            angleStart: number// = 0

            /**An easing function for nonlinear interpolation of values. Accepts a single parameter of time as a value from 0-1, inclusive. Expected outputs are values from 0-1, inclusive. */
            customEase: Function
            /**If particles should be emitted during update() calls. Setting this to false stops new particles from being created, but allows existing ones to die out. */
            emit: boolean
            /**The amount of time in seconds to emit for before setting emit to false. A value of -1 is an unlimited amount of time. */
            emitterLifetime: number// = -1

            /**The ending alpha of all particles. */
            endAlpha: number// = 1

            /**The ending color of all particles, as red, green, and blue uints from 0-255. */
            endColor: Array<number>
            /**The ending scale of all particles. */
            endScale: number// = 1

            /**The ending speed of all particles. */
            endSpeed: number// = 0

            /**Extra data for use in custom particles. The emitter doesn't look inside, but passes it on to the particle to use in init(). */
            extraData: Object
            /**Time between particle spawns in seconds. If this value is not a number greater than 0, it will be set to 1 (particle per second) to prevent infinite loops. */
            frequency: number
            /**The maximum lifetime for a particle, in seconds. */
            maxLifetime: number
            /**Maximum number of particles to keep alive at a time. If this limit is reached, no more particles will spawn until some have died. */
            maxParticles: number// = 1000

            /**The maximum rotation speed for a particle, in degrees per second. This only visually spins the particle, it does not change direction of movement. */
            maxRotationSpeed: number
            /**The maximum start rotation for a particle, in degrees. This value is ignored if the spawn type is "burst" or "arc". */
            maxStartRotation: number
            /**A minimum multiplier for the scale of a particle at both start and end. A value between minimumScaleMultiplier and 1 is randomly generated and multiplied with startScale and endScale to provide the actual startScale and endScale for each particle. */
            minimumScaleMultiplier: number// = 1

            /**The minimum lifetime for a particle, in seconds. */
            minLifetime: number
            /**The minimum rotation speed for a particle, in degrees per second. This only visually spins the particle, it does not change direction of movement. */
            minRotationSpeed: number
            /**The minimum start rotation for a particle, in degrees. This value is ignored if the spawn type is "burst" or "arc". */
            minStartRotation: number
            /**The world position of the emitter's owner, to add spawnPos to when spawning particles. To change this, use updateOwnerPos(). */
            ownerPos: PIXI.Point// = { x: 0, y: 0 }

            /**The display object to add particles to. Settings this will dump any active particles. */
            parent: PIXI.Container
            /**The blend mode for all particles, as named by PIXI.blendModes. */
            particleBlendMode: number
            /**The constructor used to create new particles. The default is the built in Particle class. Setting this will dump any active or pooled particles, if the emitter has already been used. */
            particleConstructor: Function
            /**The current number of active particles. */
            particleCount: number
            /**An array of PIXI Texture objects. */
            particleImages: Array<PIXI.Texture>
            /**Spacing between particles in a burst. 0 gives a random angle for each particle. */
            particleSpacing: number// = 0

            /**number of particles to spawn each wave in a burst. */
            particlesPerWave: number// = 1

            /**Rotation of the emitter or emitter's owner in degrees. This is added to the calculated spawn angle. To change this, use rotate(). */
            rotation: number// = 0

            /**A circle relative to spawnPos to spawn particles inside if the spawn type is "circle". */
            spawnCircle: PIXI.Circle
            /**Position at which to spawn particles, relative to the emitter's owner's origin. For example, the flames of a rocket travelling right might have a spawnPos of {x:-50, y:0}. to spawn at the rear of the rocket. To change this, use updateSpawnPos(). */
            spawnPos: PIXI.Point
            /**A rectangle relative to spawnPos to spawn particles inside if the spawn type is "rect". */
            spawnRect: PIXI.Rectangle
            /**How the particles will be spawned. Valid types are "point", "rectangle", "circle", "burst", "ring". */
            spawnType: String
            /**The starting alpha of all particles. */
            startAlpha: number// = 1

            /**The starting color of all particles, as red, green, and blue uints from 0-255. */
            startColor: Array<number>
            /**The starting scale of all particles. */
            startScale: number// = 1

            /**The starting speed of all particles. */
            startSpeed: number// = 0
        }
        export class Particle extends Sprite {
            constructor(emitter: Emitter)
            static parseArt(art: Texture[]): Texture[]
            static parseData(extraData)
            applyArt(art: Texture)
            destroy()
            init()
            kill()
            update(delta: number): number

            /**Acceleration to apply to the particle.*/
            accleration: Point
            /**The current age of the particle, in seconds.*/
            age: number
            /**A simple easing function to be applied to all properties that are being interpolated.*/
            ease: Function
            /**The emitter that controls this particle.*/
            emitter: Emitter
            /**The alpha of the particle at the end of its life.*/
            endAlpha: number
            /**The tint of the particle at the start of its life.*/
            endColor: Array<number>
            /**The scale of the particle at the start of its life.*/
            endScale: number
            /**The speed of the particle at the end of its life.*/
            endSpeed: number
            /**Extra data that the emitter passes along for custom particles.*/
            extraData: Object
            /**The maximum lifetime of this particle, in seconds.*/
            maxLife: number
            /**The alpha of the particle at the start of its life.*/
            startAlpha: number
            /**The tint of the particle at the start of its life.*/
            startColor: Array<number>
            /**The scale of the particle at the start of its life.*/
            startScale: number
            /**The speed of the particle at the start of its life.*/
            startSpeed: number
            /**The velocity of the particle. Speed may change, but the angle also contained in velocity is constant.*/
            velocity: Point
        }
        /**
         * Contains helper functions for particles and emitters to use.
         * @class ParticleUtils
         * @static
         */
        export var ParticleUtils: {
            /**
             * Rotates a point by a given angle.
             * @method rotatePoint
             * @param {Number} angle The angle to rotate by in degrees
             * @param {PIXI.Point} p The point to rotate around 0,0.
             * @static
             */
            rotatePoint(angle: number, p: Point)

            /**
             * Combines separate color components (0-255) into a single uint color.
             * @method combineRGBComponents
             * @param {uint} r The red value of the color
             * @param {uint} g The green value of the color
             * @param {uint} b The blue value of the color
             * @return {uint} The color in the form of 0xRRGGBB
             * @static
             */
            combineRGBComponents(r: number, g: number, b: number)

            /**
             * Converts a hex string from "#AARRGGBB", "#RRGGBB", "0xAARRGGBB", "0xRRGGBB",
             * "AARRGGBB", or "RRGGBB" to an array of ints of 0-255 or Numbers from 0-1, as
             * [r, g, b, (a)].
             * @method hexToRGB
             * @param {String} color The input color string.
             * @param {Array} output An array to put the output in. If omitted, a new array is created.
             * @return The array of numeric color values.
             * @static
             */
            hexToRGB(color: string, output: number[])
        }
        export class PathParticle { }
    }
}