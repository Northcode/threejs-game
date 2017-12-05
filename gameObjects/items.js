/*

  File: items.js

  This file contains the items.
  For now this is just the key parts.

 */
class CubeItem extends GameObject
{
    constructor() {
	super()
	this.model = new Physijs.BoxMesh(
	    new THREE.CubeGeometry(1,1,1),
	    Physijs.createMaterial(new THREE.MeshStandardMaterial({ color: 0x2222aa, transparent: true, opacity: 0}), 0.5, 0.5), 0)

	this.rotation = { x: 0, y: 0, z: 0 }
	this.tween = new TWEEN.Tween(this.rotation)
	    .to({ x: Math.PI, y: Math.PI, z: Math.PI }, 2000)
	    .repeat(Infinity)
	    .onUpdate(() => {
		this.model.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z)
		this.model.__dirtyRotation = true
	    })

	this.tween.start()
    }
}
