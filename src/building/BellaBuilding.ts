import * as THREE from 'three'

export class BellaBuilding extends THREE.Group {
  private readonly whiteMat = new THREE.MeshStandardMaterial({
    color: '#eef3f7',
    roughness: 0.92,
    metalness: 0.04,
  })

  private readonly lightWhiteMat = new THREE.MeshStandardMaterial({
    color: '#f7fbff',
    roughness: 0.9,
    metalness: 0.02,
  })

  private readonly glassBlueMat = new THREE.MeshStandardMaterial({
    color: '#0f4ea2',
    roughness: 0.18,
    metalness: 0.25,
  })

  private readonly glassDarkMat = new THREE.MeshStandardMaterial({
    color: '#062b66',
    roughness: 0.22,
    metalness: 0.18,
  })

  private readonly deepBlueMat = new THREE.MeshStandardMaterial({
    color: '#0b3b86',
    roughness: 0.55,
    metalness: 0.06,
  })

  private readonly navyMat = new THREE.MeshStandardMaterial({
    color: '#052a5d',
    roughness: 0.62,
    metalness: 0.04,
  })

  private readonly darkMat = new THREE.MeshStandardMaterial({
    color: '#1c2836',
    roughness: 0.82,
    metalness: 0.04,
  })

  private readonly glassAccentMat = new THREE.MeshStandardMaterial({
    color: '#1c5fc4',
    roughness: 0.18,
    metalness: 0.22,
  })

  constructor() {
    super()
    this.name = 'BellaDurmienteBuilding'

    this.buildMainMass()
    this.buildFacadePanels()
    this.buildGroundFloor()
    this.buildDetails()
  }

  private buildMainMass(): void {
    // Volumen principal
    this.addBox(6.8, 13.6, 1.25, 0, 6.8, 0, this.whiteMat)

    // Remate superior
    this.addBox(7.2, 0.4, 1.32, 0, 13.55, 0, this.lightWhiteMat)
    this.addBox(4.2, 0.7, 1.18, 0.8, 14.1, -0.02, this.lightWhiteMat)

    // Base inferior
    this.addBox(7.1, 0.7, 1.34, 0, 0.35, 0, this.whiteMat)

    // Columnas blancas verticales
    this.addBox(0.34, 10.4, 0.14, -2.1, 7.5, 0.58, this.lightWhiteMat)
    this.addBox(0.34, 10.6, 0.14, -0.9, 7.6, 0.58, this.lightWhiteMat)
    this.addBox(0.34, 10.3, 0.14, 1.25, 7.45, 0.58, this.lightWhiteMat)
    this.addBox(0.34, 10.0, 0.14, 2.35, 7.3, 0.58, this.lightWhiteMat)

    // Franja horizontal media
    this.addBox(6.3, 0.3, 0.14, 0.15, 5.75, 0.58, this.lightWhiteMat)

    // Marco lateral izquierdo alto
    this.addBox(0.42, 11.9, 0.14, -2.65, 7.75, 0.58, this.lightWhiteMat)

    // Faja blanca inferior donde se apoyan los vitrales
    this.addBox(6.0, 0.38, 0.16, 0.1, 3.1, 0.58, this.lightWhiteMat)
  }

  private buildFacadePanels(): void {
    // Columna angosta izquierda azul
    this.addBox(0.82, 9.7, 0.08, -2.25, 8.1, 0.66, this.glassBlueMat)

    // Gran paño central azul
    this.addBox(2.22, 9.85, 0.08, 0.1, 8.05, 0.66, this.glassBlueMat)

    // Paños derechos por niveles
    this.addBox(1.8, 1.55, 0.08, 2.1, 10.95, 0.66, this.glassAccentMat)
    this.addBox(1.8, 1.6, 0.08, 2.1, 8.55, 0.66, this.glassBlueMat)
    this.addBox(1.8, 1.58, 0.08, 2.1, 6.15, 0.66, this.glassBlueMat)

    // Franjas blancas entre paños derechos
    this.addBox(1.96, 0.34, 0.12, 2.12, 9.65, 0.6, this.lightWhiteMat)
    this.addBox(1.96, 0.34, 0.12, 2.12, 7.25, 0.6, this.lightWhiteMat)

    // Paños inferiores azules
    this.addBox(1.08, 1.58, 0.08, -1.45, 4.1, 0.66, this.glassBlueMat)
    this.addBox(1.08, 1.58, 0.08, -0.2, 4.1, 0.66, this.glassBlueMat)
    this.addBox(1.08, 1.58, 0.08, 1.05, 4.1, 0.66, this.glassBlueMat)

    // Zócalo oscuro de vidrios del primer nivel
    this.addBox(5.85, 1.75, 0.08, 0.15, 2.05, 0.66, this.glassDarkMat)

    // Líneas sutiles del gran paño central
    this.addGrid(2.22, 9.85, 0.02, 0.1, 8.05, 0.72, 4, 8, '#184f9d')

    // Líneas de la columna azul izquierda
    this.addGrid(0.82, 9.7, 0.02, -2.25, 8.1, 0.72, 1, 8, '#2157a8')

    // Líneas de los paños derechos
    this.addGrid(1.8, 1.55, 0.02, 2.1, 10.95, 0.72, 2, 1, '#2058ab')
    this.addGrid(1.8, 1.6, 0.02, 2.1, 8.55, 0.72, 2, 1, '#2058ab')
    this.addGrid(1.8, 1.58, 0.02, 2.1, 6.15, 0.72, 2, 1, '#2058ab')

    // Líneas paños inferiores
    this.addGrid(1.08, 1.58, 0.02, -1.45, 4.1, 0.72, 1, 1, '#2058ab')
    this.addGrid(1.08, 1.58, 0.02, -0.2, 4.1, 0.72, 1, 1, '#2058ab')
    this.addGrid(1.08, 1.58, 0.02, 1.05, 4.1, 0.72, 1, 1, '#2058ab')
  }

  private buildGroundFloor(): void {
    // Portón izquierdo
    this.addBox(1.25, 2.1, 0.16, -1.9, 1.35, 0.63, this.deepBlueMat)

    // Entrada central
    this.addBox(1.0, 2.1, 0.16, 0.05, 1.35, 0.63, this.lightWhiteMat)
    this.addBox(0.55, 1.45, 0.05, 0.05, 1.38, 0.72, this.darkMat)

    // Bahía derecha / local
    this.addBox(1.85, 2.1, 0.16, 2.0, 1.35, 0.63, this.whiteMat)
    this.addBox(1.55, 1.5, 0.05, 2.0, 1.42, 0.72, this.darkMat)

    // Letrero grande HOSPEDAJE
    this.addBox(2.8, 0.8, 0.3, -0.45, 2.25, 0.78, this.deepBlueMat)

    // Letrero abogados
    this.addBox(1.65, 0.82, 0.28, 2.0, 2.25, 0.78, this.deepBlueMat)

    // Base letrero lateral medio
    this.addBox(1.65, 1.2, 0.24, 2.1, 5.7, 0.8, this.deepBlueMat)

    // Placa circular aproximada
    const plaque = new THREE.Mesh(
      new THREE.CylinderGeometry(0.36, 0.36, 0.08, 32),
      this.lightWhiteMat,
    )
    plaque.rotation.y = Math.PI / 2
    plaque.position.set(-2.15, 4.3, 0.78)
    plaque.castShadow = true
    plaque.receiveShadow = true
    this.add(plaque)

    // Placa vertical pequeña debajo del círculo
    this.addBox(0.6, 0.9, 0.08, -2.18, 3.35, 0.72, this.lightWhiteMat)
  }

  private buildDetails(): void {
    // Ventanas abiertas / salientes
    this.addBox(0.42, 0.3, 0.5, 1.95, 8.55, 0.86, this.glassBlueMat)
    this.addBox(0.42, 0.3, 0.5, 1.95, 6.15, 0.86, this.glassBlueMat)
    this.addBox(0.42, 0.3, 0.5, 0.0, 4.15, 0.86, this.glassBlueMat)
    this.addBox(0.42, 0.3, 0.5, 1.15, 4.15, 0.86, this.glassBlueMat)

    // Aleros/viseras pequeños sobre primer nivel
    this.addBox(0.18, 1.45, 0.16, -1.55, 1.65, 0.85, this.lightWhiteMat)
    this.addBox(0.18, 1.45, 0.16, -0.35, 1.65, 0.85, this.lightWhiteMat)
    this.addBox(0.18, 1.45, 0.16, 0.85, 1.65, 0.85, this.lightWhiteMat)
    this.addBox(0.18, 1.45, 0.16, 1.95, 1.65, 0.85, this.lightWhiteMat)

    // Rótulo vertical izquierdo
    this.addBox(0.34, 4.95, 0.18, -2.62, 11.0, 0.82, this.deepBlueMat)

    // Marco del letrero HOSPEDAJE grande
    this.addThinBorder(-0.45, 2.25, 0.95, 2.8, 0.8)

    // Marco del letrero medio
    this.addThinBorder(2.1, 5.7, 0.95, 1.65, 1.2)

    // Marco abogados
    this.addThinBorder(2.0, 2.25, 0.93, 1.65, 0.82)

    // Sombras suaves laterales para que se lea más el volumen
    this.addBox(0.12, 13.2, 0.06, -3.38, 6.95, 0.6, this.darkMat)
    this.addBox(0.1, 12.4, 0.06, 3.32, 6.65, 0.6, this.darkMat)
  }

  private addBox(
    width: number,
    height: number,
    depth: number,
    x: number,
    y: number,
    z: number,
    material: THREE.Material,
  ): THREE.Mesh {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      material,
    )

    mesh.position.set(x, y, z)
    mesh.castShadow = true
    mesh.receiveShadow = true
    this.add(mesh)
    return mesh
  }

  private addGrid(
    width: number,
    height: number,
    depth: number,
    x: number,
    y: number,
    z: number,
    cols: number,
    rows: number,
    color: string,
  ): void {
    const lineMat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.45,
      metalness: 0.12,
    })

    const colWidth = width / cols
    const rowHeight = height / rows

    for (let i = 1; i < cols; i += 1) {
      const gx = x - width / 2 + i * colWidth
      this.addBox(0.03, height, depth, gx, y, z, lineMat)
    }

    for (let j = 1; j < rows; j += 1) {
      const gy = y - height / 2 + j * rowHeight
      this.addBox(width, 0.03, depth, x, gy, z, lineMat)
    }
  }

  private addThinBorder(
    x: number,
    y: number,
    z: number,
    width: number,
    height: number,
  ): void {
    const borderMat = new THREE.MeshStandardMaterial({
      color: '#d9e5f2',
      roughness: 0.6,
      metalness: 0.08,
    })

    const t = 0.05

    this.addBox(width + t, t, 0.04, x, y + height / 2, z, borderMat)
    this.addBox(width + t, t, 0.04, x, y - height / 2, z, borderMat)
    this.addBox(t, height, 0.04, x - width / 2, y, z, borderMat)
    this.addBox(t, height, 0.04, x + width / 2, y, z, borderMat)
  }
}