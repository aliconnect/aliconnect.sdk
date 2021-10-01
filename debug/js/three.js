(function () {
  Object.assign(document.currentScript, {
    three (callback){
      const SELECT_OPACITY = 0.8; // opacity value for ThreeD objects selected
      const BASE_OPACITY = 1; // default opacity value for ThreeD objects
      const el = this.elem;
      const container = this.elem;
      const mouse = { x: 0, y: 0 };
      const dmouse = { x: 0, y: 0 };
      let targetList = [];
      let objectList = [];
      const baseopacity = 1;
      const hoveropacity = 0.8;
      const selectopacity = 0.6;
      let controls;
      // this.objectList = $.threeObjects = [];
      (async () => {
        var url = new URL($.config.apiPath);
        await importScript('three/build/three.js');
        await importScript('three/examples/js/controls/OrbitControls.js');
        var textureLoader = new THREE.TextureLoader();
        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setClearColor(0xcfcfcf, .5);
        this
        .on('mouseenter', e => {
          controls = new THREE.OrbitControls(camera, renderer.domElement);
          controls.zoomSpeed= 0.1;
          controls.addEventListener('change', render);
        })
        .on('mouseleave', e => {
          controls.dispose();
        })
        .on('mousedown', e => {
          console.log('DOWN');
          var rect = container.getBoundingClientRect();
          mouse.x = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1;
          mouse.y = -((e.clientY - rect.top) / container.clientHeight) * 2 + 1;
          var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
          vector.unproject(camera);
          var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
          console.log(targetList);
          var intersects = ray.intersectObjects(targetList);
          console.log(intersects);
          if (intersects.length > 0) {
            this.objectclick = intersects[0].object;
          }
          console.log(this.objectclick);
          render();
        })
        .on('mouseup', e => {
          var rect = container.getBoundingClientRect();
          mouse.x = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1;
          mouse.y = -((e.clientY - rect.top) / container.clientHeight) * 2 + 1;
          var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
          vector.unproject(camera);
          var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
          var intersects = ray.intersectObjects(targetList);
          if (intersects.length > 0) {
            var p = this.objectclick = intersects[0].object;
            while (p && !p.itemID) p = p.parent;
            var itemID = p.itemID;// || Three.objectclick.parent.itemID || Three.objectclick.parent.parent.itemID;
            if (itemID) {
              // console.log('HIT',itemID);
              this.objectselect = this.objectclick;
              for (var i = 0, e; e = targetList[i]; i++) { e.material.opacity = baseopacity; }
              //intersects[0].object.selected = true;
              this.objectselect.material.opacity = selectopacity;
              console.log("Hit @ ", this.objectselect, itemID, $({tag:`System(${itemID})`}));
              $('view').show($({tag:`Equipment(${itemID})`}));
              // Aim.URL.set({ schema:'item', id: itemID });
            }
          }
          render();
        })
        .on('mousemove', e => {
          var rect = container.getBoundingClientRect();
          mouse.x = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1;
          mouse.y = -((e.clientY - rect.top) / container.clientHeight) * 2 + 1;
          var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
          vector.unproject(camera);
          var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
          var intersects = ray.intersectObjects(targetList);
          if (this.objecthover) {
            //hoverelement.object.material.color = hoverelement.orgcolor;
            this.objecthover.material.opacity = this.objecthover.opacity;
          }
          if (intersects.length > 0) {
            this.objecthover = intersects[0].object;
            if (!this.objecthover.opacity) this.objecthover.opacity = this.objecthover.material.opacity;
            if (!this.objecthover.color) this.objecthover.color = this.objecthover.material.color;
            this.objecthover.material.opacity = hoveropacity;
            //hoverelement.object.material.color = { r: 255, g: 0, b: 0 };
          }
          if (this.objectselect) this.objectselect.material.opacity = selectopacity;
          render();
        });
        el.appendChild( renderer.domElement );
        window.addEventListener( 'resize', onWindowResize );
        // animate();
        this.build = params => {
          console.log('BUILD', params.body);
          targetList = [];
          objectList = [];
          data3d = params.body || params.target.data;
          scale = data3d.scale || 1;
          size = {
            x: data3d.object.w / scale,
            y: data3d.object.depth / scale,
            // x: data3d.object.sizeX / scale,
            // y: data3d.object.sizeY / scale,
          };
          data3d.object.depth = null;
          data3d.object.w = null;
          if (group) {
            clearThree(group);
          } else {
            console.log(size);
            camera.position.set(0, size.x / 2, size.y / 2);
            camera.lookAt(scene.position);
            //var floorMaterial = new THREE.MeshBasicMaterial({ map: loader.load("https://aliconnect.nl" + data3d.floorplan.src), side: THREE.DoubleSide });
            // data3d.floorplan.src = "https://aliconnect.nl" + data3d.floorplan.src;
            if (data3d.floorplan) {
              var floorMaterial = data3d.floorplan.src
              ? new THREE.MeshBasicMaterial({ map: textureLoader.load('https://aliconnect.nl' + data3d.floorplan.src) })
              : new THREE.MeshBasicMaterial({ color: data3d.floorplan.color ? parseInt(data3d.floorplan.color) : 0x999999 });
              var floorGeometry = new THREE.PlaneGeometry(size.x, size.y, 0, 0);
              var floor = new THREE.Mesh(floorGeometry, floorMaterial);
              floor.rotation.x = -Math.PI / 2;
              scene.add(floor);
            }
            group = new THREE.Group();
            group.position.x = -size.x / 2;
            group.position.z = size.y / 2;
            group.rotation.y = Math.PI * (data3d.object.r + 180) / 180;
            var s = 1 / scale;
            group.scale.set(s, s, s);
            scene.add(group);
          }
          redraw();
        };
        callback(this);
        console.log('INIT');
        let group;
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(100, 1, 0.1, 8000);
        var light = new THREE.PointLight(0xffffff, 0.8, 0, 20);
        camera.add(light);
        scene.add(camera);
        var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
        hemiLight.position.set(0, 500, 0);
        scene.add(hemiLight);
        // scene.background = new THREE.Color( 0xdddddd );
        // camera.position.z = 400;
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( el.clientWidth, el.clientHeight );
        function clearThree(obj) {
          if (obj.children) {
            while (obj.children.length > 0) {
              clearThree(obj.children[0]);
              obj.remove(obj.children[0]);
            }
          }
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) obj.material.dispose();
          if (obj.texture) obj.texture.dispose();
        }
        function redraw() {
          createObject(data3d.object, group);
          setTimeout(render, 1);
        }
        function shape(shapename, fx) {
          var apts = [];
          if (!data3d.shape[shapename]) return console.error(shapename);
          var vectors = data3d.shape[shapename].vectors.slice(0);
          var width = 0;
          var left = 9999999;
          var height = 0;
          var minheight = 9999999;
          var vecbottom = 999999;
          var vecleft = 999999;
          for (var i = 0; i < vectors.length; i += 2) {
            vectors[i] *= -1;
            vecbottom = Math.min(vecbottom, vectors[i + 1]);
            vecleft = Math.min(vecleft, vectors[i]);
          }
          for (var i = 0; i < vectors.length; i += 2) {
            vectors[i + 1] -= vecbottom;
            vectors[i] -= vecleft;
            left = Math.min(left, vectors[i]);
            width = Math.max(width, vectors[i]);
            height = Math.max(height, vectors[i + 1]);
          }
          for (var i = 0; i < vectors.length; i += 2) {
            if (fx) vectors[i] = -vectors[i] + width / 2;
            else vectors[i] -= width / 2;
            var pts = new THREE.Vector2(vectors[i], vectors[i + 1]);
            apts.push(pts);
          }
          var shape = new THREE.Shape(apts);
          shape.left = left;
          shape.width = width;
          shape.height = height;
          return shape;
        }
        function createObject(obj, grp) {
          // if (obj.geo && data3d.geo[obj.geo]) {
          //   Object.assign(obj, data3d.geo[obj.geo]);
          //   console.log(obj.geo, data3d.geo[obj.geo], obj);
          // }
          obj.baseColor = obj.color || '0x999999';
          if (grp.src) {
            if (obj.left != undefined && obj.right != undefined) {
              obj.w = grp.src.w - obj.left - obj.right;
            } else if (!obj.w) {
              obj.w = grp.src.w;
            }
            if (obj.left != undefined) {
              obj.x = -grp.src.w / 2 + obj.left + obj.w / 2;
            } else if (obj.right != undefined) {
              obj.x = grp.src.w / 2 - obj.right - obj.w / 2;
            }
            if (!obj.h) {
              obj.h = grp.src.h - (obj.bottom || 0) - (obj.top || 0);
            }
            if (obj.bottom != undefined) {
              obj.y = obj.bottom;
            } else if (obj.top != undefined) {
              obj.y = grp.src.h - obj.top - obj.h;
            }
            if (obj.begin != undefined && obj.end != undefined) {
              obj.depth = grp.src.depth - obj.begin - obj.end;
            } else if (!obj.depth) {
              obj.depth = grp.src.depth - 10; if (obj.z == undefined) obj.z = 5;
            }
            if (obj.begin != undefined) {
              obj.z = obj.begin;
            } else if (obj.end != undefined) {
              obj.z = grp.src.depth - obj.end - obj.src.depth;
            }
          }
          var mesh;
          for (let [key, value] of Object.entries(obj)) {
            if (key in THREE) {
              // //console.error(key,value);
              if (obj.texture) {
                var material = new THREE.MeshBasicMaterial( {
                  map: textureLoader.load( obj.texture )
                } );
              } else if (obj.material) {
                material = new THREE.MeshBasicMaterial( Object.assign(obj.material, {transparent: true}) );
              } else if (obj.color) {
                material = new THREE.MeshBasicMaterial( {
                  color: obj.color,//parseInt(obj.color),
                  reflectivity: 0,
                  // opacity: obj.opacity,
                  transparent: true,
                  // alphaMap: 0.1,
                } );
              }
              var geometry = new THREE[key](...value);
              mesh = new THREE.Mesh( geometry, material );
              break;
            }
          }
          // console.log(mesh);
          // if (obj.l && obj.w && obj.h) {
          //   obj.geo = obj.geo || 'BoxBufferGeometry';
          // }
          if (obj.geo) {
            // console.log(obj.geo, data3d.geo[obj.geo], obj);
            // if (data3d.geo[obj.geo]) {
            // }
            // if (obj.texture) {
            //   var material = new THREE.MeshBasicMaterial( {
            //     map: textureLoader.load( obj.texture )
            //   } );
            // } else if (obj.color) {
            //   material = new THREE.MeshBasicMaterial( {
            //     color: parseInt(obj.color),
            //     reflectivity: 0,
            //     transparent: true,
            //     // side: THREE.DoubleSide,
            //   } );
            // }
            // var geometry = new THREE[obj.geo]( obj.w, obj.h, obj.l );
            // var mesh = new THREE.Mesh( geometry, material );
            // // var box = new THREE.Box3().setFromObject( mesh );
            // // mesh.position.y -= box.min.y;
            // // mesh.position.x += box.min.x;
            // // mesh.position.z += box.min.z;
            //
            // // //console.log( box );
          }
          if (obj.shape) {
            obj.shape = shape(obj.shape, obj.fx);
            var geometry = new THREE.ExtrudeGeometry(obj.shape, { depth: obj.depth });
            if (obj.shape.color) {
              obj.baseColor = obj.shape.color;
            }
            if (obj.shininess === -1) {
              var material = new THREE.MeshStandardMaterial({
                color: parseInt(obj.baseColor),
                reflectivity: 0,
                transparent: true,
              });
            } else {
              var material = new THREE.MeshPhongMaterial({
                color: parseInt(obj.baseColor),
                //shininess: obj.shininess || 80,
                reflectivity: .5,
                transparent: true,
              });
            }
            var mesh = obj.mesh = new THREE.Mesh(geometry, material);
            if (obj.h) {
              mesh.scale.y = obj.h / obj.shape.height; //// //console.log('SCALE', this, mesh, mesh.scale);
            }
            if (obj.w) {
              mesh.scale.x = obj.w / obj.shape.width;
            }
            targetList.push(mesh);
          } else {
            var mesh = obj.mesh || new THREE.Group();
          }
          mesh.colorSet = function(color) {
            if (obj.material) {
              obj.material.color.setHex(parseInt(color || obj.src.baseColor));
            }
            obj.children.forEach(child => child.colorSet(color))
          };
          // mesh.src = grp;
          // mesh.obj = obj;
          // obj.mesh = mesh;
          mesh.src = obj;
          // mesh.onchange = obj.onchange;
          if (obj.name) {
            objectList.push(objectList[obj.name] = mesh);
          }
          if (obj.itemID) {
            // console.log(obj.itemID, mesh);
            //stateitemlist.push(obj.id);
            meshitems[obj.itemID] = mesh;
            mesh.itemID = obj.itemID;
            // mesh.item = obj;
          }
          // DEBUG: Uitgezet ivm nieuwe opzet !!!!!, werkt tunnel sim nog wel?
          //mesh.position.set((-obj.x || 0), (obj.y || 0), (obj.z || 0) );
          grp.posz = grp.posz || 0;
          grp.posx = grp.posx || 0;
          if (obj.z != undefined) grp.posz = obj.z;
          if (obj.x != undefined) grp.posx = -obj.x;
          mesh.position.z = grp.posz;
          mesh.position.x = grp.posx;
          mesh.position.y = obj.y || 0;
          if (obj.ry == 180) {
            mesh.position.z += obj.depth;
          }
          if (obj.ry == 90) {
            grp.posz += obj.w;
            grp.posx -= obj.depth
          } else if (obj.ry == -90) {
            grp.posz += obj.w;
            grp.posx += obj.depth
          } else {
            grp.posz += obj.depth;
          }
          mesh.rotation.x = (obj.rx || 0) / 180 * Math.PI;
          mesh.rotation.y = (-obj.ry || 0) / 180 * Math.PI;
          mesh.rotation.z = (obj.rz || 0) / 180 * Math.PI;
          mesh.absr = (grp.absr || 0) + (obj.rz || 0);
          if (mesh.absr == 90) {
            mesh.position.x += obj.depth;
          }
          grp.add(mesh);
          // if (obj.geo) {
          //   console.log(obj.geo, obj, mesh);
          // }
          if (obj.children) {
            obj.children.forEach(child => createObject(child, mesh) );
          }
        }
        // if (params.body) build(params);
        function render() {
          renderer.render(scene, camera);
        }
        function animate() {
          requestAnimationFrame( animate );
          controls.update();
          renderer.render( scene, camera );
        }
        function onWindowResize() {
          camera.aspect = el.clientWidth / el.clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize( el.clientWidth, el.clientHeight );
        }
      })();
      return this;
    }
  })
})()
