const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const scoreEl = document.getElementById('scoreEl')

canvas.width = innerWidth - 20
canvas.height = innerHeight - 5

class Ship {
    constructor() {
        this.velocity = {
            x: 0,
            y: 0
        }

        this.opacity = 1

        const playerImage = new Image()
        playerImage.src = '/static/images/Game3/spaceship.png'

        playerImage.onload = () => {
            this.image = playerImage
            this.width = 156
            this.height = 76
            this.position = {
                x: 700,
                y: 700
            }    
        }
    }

    init() {
        c.save()
        c.globalAlpha = this.opacity
        c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
        c.restore()
    }

    animate() {
        if (this.image) {
            this.init()
            this.position.x += this.velocity.x
        }
    }
}

class Laser {
    constructor({ position, velocity }) {
        this.position = position
        this.velocity = velocity
        this.width = 5
        this.height = 30
    }

    init() {
        c.fillStyle = 'red'
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }

    animate() {
        this.init()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

class Enemy {
    constructor({ position }) {
        this.velocity = {
            x: 0,
            y: 0
        }

        const enemyImage = new Image()
        enemyImage.src = '/static/images/Game3/enemy.png'

        enemyImage.onload = () => {
            this.image = enemyImage
            this.width = 46
            this.height = 36
            this.position = {
                x: position.x,
                y: position.y
            }
        }
    }

    init() {
        c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
    }

    animate({ vel }) {
        if (this.image) {
            this.init()
            this.position.x += vel.x
            this.position.y += vel.y
        }
    }
    
    attack(projectiles) {
        projectiles.push(
            new EnemyLaser({
                position: {
                    x: this.position.x + this.width / 2,
                    y: this.position.y + this.height / 2
                },

                velocity: {
                    x: 0,
                    y: 4
                }
            })
        )
    }
}

class EnemyGrid {
    constructor() {
        this.position = {
            x: 0,
            y: 0
        }

        this.velocity = {
            x: 4,
            y: 0 
        }

        this.enemies = []

        const rws = Math.floor(Math.random() * 6 + 3)
        const cls = Math.floor(Math.random() * 4 + 2)

        this.width = cls * 76

        for (let i = 0; i < cls; i++) {
            for (let r = 0; r < rws; r++) {
                this.enemies.push(
                    new Enemy({
                        position: {
                            x: i * 50,
                            y: r * 50
                        }
                    })
                )
            }
        }
    }

    animate() {
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        this.velocity.y = 0

        if (this.position.x + this.width >= canvas.width || this.position.x <= 0) {
            this.velocity.x = -this.velocity.x
            this.velocity.y = 76
        }
    }
}

class EnemyLaser {
    constructor({ position, velocity }) {
        this.position = position
        this.velocity = velocity
        this.width = 5
        this.height = 30
    }

    init() {
        c.fillStyle = 'green'
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }

    animate() {
        this.init()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

class AnimatedParticle {
    constructor({ position, velocity, radius, color, conditionalFading }) {
        this.position = position
        this.velocity = velocity
        this.radius = radius
        this.color = color
        this.opacity = 1
        this.conditionalFading = conditionalFading
    }

    init() {
        c.save()
        c.globalAlpha = this.opacity
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
        c.closePath()
        c.restore()
    }

    animate() {
        this.init()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        if (this.conditionalFading) this.opacity -= 0.01
    }
}


const player = new Ship()
const lasers = []
const enemy_grids = []
const enemy_projectiles = []
const particles = []
const keys = {
    left: {
        pressed: false
    },

    right: {
        pressed: false
    }
}

let enemy_frames = 0
let score = 0
let animationLoop = {
    stop: false,
    play: true
}

// Background stars
for (let i = 0; i < 150; i++) {
    particles.push(
        new AnimatedParticle({
            position: {
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height
            },

            velocity: {
                x: 0,
                y: 1.4
            },

            radius: 3,
            color: 'white'
        })
    )
}

function initParticles({ sprite, color, conditionalFading }) {
    for (let i = 0; i < 10; i++) {
        particles.push(
            new AnimatedParticle({
                position: {
                    x: sprite.position.x + sprite.width / 2,
                    y: sprite.position.y + sprite.height / 2
                },

                velocity: {
                    x: (Math.random() - 0.5) * 3,
                    y: (Math.random() - 0.5) * 3
                },

                radius: 5,
                color: color,
                conditionalFading: conditionalFading
            })
        )
    }
}

function animate() {
    if (!animationLoop.play) return 
    requestAnimationFrame(animate)

    c.fillStyle = '#000'
    c.fillRect(0, 0, canvas.width, canvas.height)

    player.animate()

    particles.forEach((particle, index) => {
        if (particle.position.y - particle.radius >= canvas.height) {
            particle.position.x = Math.random() * canvas.width
            particle.position.y = -particle.radius
        }

        if (particle.opacity <= 0) {
            setTimeout(() => {
                particles.splice(index, 1)
            }, 0);
        } else {
            particle.animate()
        }
    })

    lasers.forEach((laser) => {
        laser.animate()
    })

    enemy_grids.forEach((enemyGrid) => {
        enemyGrid.animate()

        if (enemy_frames % 100 === 0 && enemyGrid.enemies.length > 0) {
            enemyGrid.enemies[Math.floor(Math.random() * enemyGrid.enemies.length)].attack(enemy_projectiles)
        }

        enemyGrid.enemies.forEach((enemy, index) => {
            enemy.animate({
                vel: enemyGrid.velocity
            })

            lasers.forEach((laser, laserIndex) => {
                if (
                    laser.position.y - laser.height <= enemy.position.y + enemy.height &&
                    laser.position.x + laser.height >= enemy.position.x &&
                    laser.position.x - laser.height <= enemy.position.x + enemy.width &&
                    laser.position.y + laser.height >= enemy.position.y
                ) {
                    setTimeout(() => {
                        const enemyDetected = enemyGrid.enemies.find((enemyDetected) => enemyDetected === enemy)
                        const laserDetected = lasers.find((laserDetected) => laserDetected === laser)
                        
                        if (enemyDetected && laserDetected) {
                            initParticles({
                                sprite: enemy,
                                color: 'green',
                                conditionalFading: true
                            })
                            
                            enemyGrid.enemies.splice(index, 1)
                            lasers.splice(laserIndex, 1)

                            score += 200
                            scoreEl.innerHTML = score
                        }
                    }, 0);
                }
            })
        })
    })

    enemy_projectiles.forEach((enemyProjectile, index) => {
        if (enemyProjectile.position.y + enemyProjectile.height >= canvas.height) {
            setTimeout(() => {
                enemy_projectiles.splice(index, 1)
            }, 0);
        } else {
            enemyProjectile.animate()
        }

        if (
            enemyProjectile.position.y + enemyProjectile.height >= player.position.y &&
            enemyProjectile.position.x + enemyProjectile.width >= player.position.x &&
            enemyProjectile.position.x <= player.position.x + player.width
        ) {
            setTimeout(() => {
                enemy_projectiles.splice(index, 1)
                player.opacity = 0
                animationLoop.stop = true
            }, 0);

            setTimeout(() => {
                animationLoop.play = false
            }, 2500);

            initParticles({
                sprite: player,
                color: 'red',
                conditionalFading: true
            })
        }
    })

    if (keys.left.pressed && player.position.x >= 0) {
        player.velocity.x = -10
    } else if (
        keys.right.pressed &&
        player.position.x + player.width <= canvas.width
    ) {
        player.velocity.x = 10
    } else {
        player.velocity.x = 0
    }

    if (enemy_frames % 500 === 0) {
        enemy_grids.push(new EnemyGrid())
        enemy_frames = 0
    }

    enemy_frames++
}

animate()

addEventListener('keydown', (event) => {
    if (animationLoop.stop) return
    switch (event.key) {
        case 'ArrowLeft':
            keys.left.pressed = true
            break
        case 'ArrowRight':
            keys.right.pressed = true
            break
        case ' ':
            lasers.push(
                new Laser({
                    position: {
                        x: player.position.x + player.width / 2,
                        y: player.position.y
                    },

                    velocity: {
                        x: 0,
                        y: -10
                    }
                })
            )
            
            break
    }
})

addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'ArrowLeft':
            keys.left.pressed = false
            break
        case 'ArrowRight':
            keys.right.pressed = false
            break
    }
})