//------------------------------------------------------
//Optener Usuario
//------------------------------------------------------
async function InicioSecion() {
  var user= document.getElementById("user").value;
  var password= document.getElementById("password").value;  
    var opciones = {
      method: 'GET'
    };
    await fetch("http://localhost:5000/Usuario/OptenerUsuarioPorCorreo?correo="+ user , opciones)
      .then(response => response.json())
      .then(resultado => {
        if(resultado.contraseña==password){
          localStorage.setItem("NombreUsuario",user);
          location.href="catalogo.html";
        }else{
          UsuarioIncorrecto();
        }        
      })
      .catch(error => {
         console.log(error);
          UsuarioIncorrecto();
        });
  }
  function UsuarioIncorrecto() {    
     document.getElementById("LoginError").innerHTML="<h2>¡ERROR! Usuario o contraseña invalida</h2>";     
}
//------------------------------------------------------
//Optener Catalgo de productos
//------------------------------------------------------
async function CargarCatalogo(){
  productos= await CargaProductosAVariable(); 
  document.getElementById("CorreoUsuario").innerHTML= localStorage.getItem("NombreUsuario");  
  var opciones = {
    method: 'GET'
  };
  await fetch("http://localhost:5000/Producto", opciones)
    .then(response => response.json())
    .then(resultado => {
      ArmarCatalogo(resultado)
    })
    .catch(error => {
       console.log(error);
      });
}
function ArmarCatalogo(resultado){
  var catalgoHTML =  "<table style='width:25%'>"+
  "<tr>"+
      "<th class='table-dark' >Total a Pagar:</th>"+
      "<th class='table-dark'><div id='TotalPagar'>0</div></th>"+   
      "<th><button button class='btn btn-primary' data-toggle='modal' data-target='#AgregarPedidoModal' button class='btn btn-primary' onclick='CrearPedido()'>Crear Pedido</button></th>"+
  "</tr>"+   
  "</table>"+
  "<table class='table table-dark table-striped' style='width:100%'>"+
    "<tr>"+
        "<th>Nombre</th>"+
        "<th>Precio Unitario</th>"+
        "<th>Descripcion</th>"+
        "<th>Cantidad</th>"+
        "<th>Precio total</th>"+
    "</tr>";  
  resultado.forEach(element => {
    catalgoHTML +=
    "<tr>" +
      "<td>"+element.nombre+"</td>" +
      "<td>"+element.precio+"</td>" +
      "<td>"+element.descripcion+"</td>" +    
      "<th><div id=Cantidad"+element.id+">0</div</th>"+
      "<th><div id=Total"+element.id+">0</div</th>"+
      "<td><button class='btn btn-primary' data-toggle='modal' data-target='#AgregarModal' onclick='PasarID("+element.id+")'>Agregar</button></td>"+
      "<td><button class='btn btn-danger' onclick='EliminarDelCarrito("+element.id+")'>Eliminar</button></td>"+
    "</tr>";
  });  
  document.getElementById("Catalogo").innerHTML=catalgoHTML+"</table>";
}
function EliminarDelCarrito(id){
  for (let index = 0; index < carrito.length; index++) {
    if(carrito[index].IDProducto==id){
      carrito.splice(index,1);
      document.getElementById("Cantidad"+id).innerHTML=0;   
      document.getElementById("Total"+id).innerHTML=0;
      document.getElementById("TotalPagar").innerHTML=OptenerTotalAPagar();   
    }
  }
}
function PasarID(ID){
    document.getElementById("BotonaAgregar").innerHTML= "<button class='btn btn-primary' type='button' onclick='AgregarPedidoActual("+ID+")'>Agregar</button>"
    document.getElementById("Etiqueta").innerHTML= "<label>Igrese la cantidad del producto selecionado para el pedido</label>"    
    document.getElementById('CantidadProducto').value = 0;
}
//------------------------------------------------------
//Agregar Pedidos
//------------------------------------------------------
var carrito=[];
function AgregarPedidoActual(id){
  var cantidad=  document.getElementById("CantidadProducto").value;  
  var IDDB=Math.floor(Math.random() * 10000);
  var objetoACarrito={
    "ID"   : IDDB,
    "IDPedido": 0,
    "IDProducto": id,
    "cantidad": Number(cantidad)
  }  
  if(carrito.length==0 && objetoACarrito.cantidad>0){
    carrito.push(objetoACarrito);
  }else{
    var aux;
    carrito.forEach(element => { 
      if(element.IDProducto==id && objetoACarrito.cantidad>0){ 
        aux=element;
        element.cantidad+=Number(cantidad);
        objetoACarrito.cantidad=element.cantidad;        
      }       
    });
      if(aux==undefined && objetoACarrito.cantidad>0){  
        carrito.push(objetoACarrito);
      }
  }  
  $('#AgregarModal').modal('hide');
  if(objetoACarrito.cantidad>0){
    document.getElementById("Cantidad"+id).innerHTML=objetoACarrito.cantidad;   
  }
  var numeroActual=document.getElementById("Cantidad"+id).textContent;
  if(numeroActual>0){  
    document.getElementById("Total"+id).innerHTML=Number(numeroActual*  ObtenerPrecio(id));
    document.getElementById("TotalPagar").innerHTML=OptenerTotalAPagar();   
  }    
  else{
    document.getElementById("Total"+id).innerHTML=0;
  }
}
function OptenerTotalAPagar(){
  var respuesta=0;
  var ids= ObtenerIDs();
  ids.forEach(element => {      
    respuesta+=Number(document.getElementById("Total"+element).textContent);
  });
  return respuesta;
}
async function CrearPedido(){
  var nombreCliente=  document.getElementById("NombreCliente").value;
  var direccionCliente=  document.getElementById("DireccionCliente").value;
  var telefono=  document.getElementById("TelefonoCliente").value;
  var correoUsuario= localStorage.getItem("NombreUsuario");
  d=new Date();
  var fecha =d.getFullYear()+"-"+d.getMonth()+"-"+d.getDate();;
  var idPedido=Math.floor(Math.random() * 10000);
  carrito.forEach(element => {
    element.IDPedido=idPedido;
  });
  var nPedido = {
    "ID"   : idPedido,
    "Responsable" :correoUsuario,
    "NombreCliente"   : nombreCliente,
    "DirecionCliente"   : direccionCliente,
    "TelefonoCliente"   : telefono,
    "Productos"   : carrito,
    "TotalAPagar"   : 0,
    "Fecha"   :fecha
  };  
  var valoresAGuardar = JSON.stringify(nPedido);  
  var encabezado = {
    'Content-Type': 'application/json'
  }  
    var opciones = {
      method: 'POST',
      headers: encabezado,
      body: valoresAGuardar
    };
  await fetch("http://localhost:5000/Pedido", opciones)
    .then(response => response.json())
    .then(resultado => {      
      alert(result);
      alert("Pedido Agregado!");
      location.reload();
    })
    .catch(error => {   
      alert("Pedido Agregado! ");
      location.reload();
       console.log(error);
      });
}
//------------------------------------------------------
//Armar pagina admi
//------------------------------------------------------
async function CargarAdmi() { 
  document.getElementById("CorreoUsuario").innerHTML= localStorage.getItem("NombreUsuario");
  productos= await CargaProductosAVariable(); 
  await CargaUsuarios();
  await CargaProductos();
  await CargaPedidos();
}   
  async function CargaUsuarios(){
    var opciones = {
      method: 'GET'
    };
    await fetch("http://localhost:5000/Usuario", opciones)
      .then(response => response.json())
      .then(resultado => {
        ArmarUsuarios(resultado); 
      })
      .catch(error => {
         console.log(error);          
        });
  }
  var productos=CargaProductosAVariable();
  async function CargaProductosAVariable(){
    var respuesta;
    var opciones = {
      method: 'GET'
    };
    await fetch("http://localhost:5000/Producto", opciones)
      .then(response => response.json())
      .then(resultado => {
      respuesta=resultado;        
      })
      .catch(error => {
         console.log(error);          
        });
        return respuesta;
}
  async function CargaProductos(){
      var opciones = {
        method: 'GET'
      };
      await fetch("http://localhost:5000/Producto", opciones)
        .then(response => response.json())
        .then(resultado => {
          ArmarProductos(resultado); 
        })
        .catch(error => {
           console.log(error);          
          });
  }
  async function CargaPedidos(){
    var opciones = {
      method: 'GET'
    };
    await fetch("http://localhost:5000/Pedido", opciones)
      .then(response => response.json())
      .then(resultado => {
        ArmarPedidos(resultado); 
      })
      .catch(error => {
         console.log(error);          
        });
}
  function ArmarUsuarios(resultado){
    var html="   <table class='table table-dark table-striped' style='width:100%'>";
    resultado.forEach(element => {
      html +=
      "<tr>" +
      "<td>"+element.correo+"</td>" +      
      "<td><button type='button' class='btn btn-danger' onclick='EliminarUsuario(\""+element.correo+"\")'>Eliminar</button></td>"+      
      "</tr>";
    });  
    document.getElementById("Usuarios").innerHTML=html+"</table>";
  }
  async function EliminarUsuario(correo){
    var opciones = {
      method: 'DELETE'
    };
    await fetch("http://localhost:5000/Usuario?correo="+correo, opciones)
      .then(response => response.json())
      .then(resultado => {
        console.log(resultado);      
      })
      .catch(error => {
         console.log(error);          
        });
        CargarAdmi();
  }  
  async function ArmarPedidos(resultado){
    var html="   <table class='table table-dark table-striped' style='width:100%'>"+
    "<tr>"+
        "<th>Responsable</th>"+       
        "<th>Nombre Cliente</th>"+       
        "<th>Direccion Cliente</th>"+       
        "<th>Telefono Cliente</th>"+       
        "<th>Total a Pagar</th>"+       
        "<th>Fecha</th>"+       
        "<th>Productos</th>"+       
    "</tr>";
    resultado.forEach(element => {
      html +=
      "<tr>" +
      "<td>"+element.responsable+"</td>" +      
      "<td>"+element.nombreCliente+"</td>" +  
      "<td>"+element.direcionCliente+"</td>" +  
      "<td>"+element.telefonoCliente+"</td>" +  
      "<td>"+element.totalAPagar+"</td>" +  
      "<td>"+element.fecha+"</td>" +  
      "<td>"+CargarProductosPedidos(element)+"</td>" +        
      "<td><button class='btn btn-danger' onclick='EliminarPedido("+element.id+")'>Eliminar</button></td>" +        
      "</tr>";
    });  
    document.getElementById("Pedidos").innerHTML=html+"</table>";
  }
  function CargarProductosPedidos( pedido){
    var html="   <table style='width:50%'>"+
    "<tr>"+
        "<th>Nombre</th>"+       
        "<th>Cantidad</th>"+  
    "</tr>";
    
    pedido.productos.forEach(element => {      
      html+=
      "<tr>" +
      "<td>"+ ObtenerNombre(element.idProducto) +"</td>" +      
      "<td>"+element.cantidad+"</td>" +  
      "</tr>";
    }); 
    return html+"</table>";   
  }
  async function AgregarUsuario(){
    var correo=  document.getElementById("Correo").value;
    var contraseña=  document.getElementById("Contraseña").value;
    var nUsuario = {
      "ID"   : correo,
      "correo" :correo,
      "contraseña"   : contraseña
    };  
    var valoresAGuardar = JSON.stringify(nUsuario);  
    var encabezado = {
      'Content-Type': 'application/json'
    }  
      var opciones = {
        method: 'POST',
        headers: encabezado,
        body: valoresAGuardar
      };
    await fetch("http://localhost:5000/Usuario", opciones)
      .then(response => response.json())
      .then(resultado => {
        alert(result)
      })
      .catch(error => {
         console.log(error);
        });
        CargarAdmi();
  }
  async function AgregarProducto(){
    var Nombre=  document.getElementById("NombreProducto").value;
    var Precio=  document.getElementById("PrecioProducto").value;
    var Descripcion=  document.getElementById("DescripcionProducto").value;    
    var id=Math.floor(Math.random() * 10000);
    var nProducto = {
      "Id": id,
      "Nombre" : Nombre,
      "Precio" : Precio,
      "Descripcion" : Descripcion
    };  
    var valoresAGuardar = JSON.stringify(nProducto);  
    var encabezado = {
      'Content-Type': 'application/json'
    }  
      var opciones = {
        method: 'POST',
        headers: encabezado,
        body: valoresAGuardar
      };
    await fetch("http://localhost:5000/Producto", opciones)
      .then(response => response.json())
      .then(resultado => {
        alert(result)
      })
      .catch(error => {
         console.log(error);
        });
        CargarAdmi();
  }
  async function ActualizarProducto(id){
    var Nombre=  document.getElementById("NombreProducto").value;
    var Precio=  document.getElementById("PrecioProducto").value;
    var Descripcion=  document.getElementById("DescripcionProducto").value;    
    var id=id
    var nProducto = {
      "Id": id,
      "Nombre" : Nombre,
      "Precio" : Precio,
      "Descripcion" : Descripcion
    };  
    var valoresAGuardar = JSON.stringify(nProducto);  
    var encabezado = {
      'Content-Type': 'application/json'
    }  
      var opciones = {
        method: 'PUT',
        headers: encabezado,
        body: valoresAGuardar
      };
    await fetch("http://localhost:5000/Producto/ActualizarProducto", opciones)
      .then(response => response.json())
      .then(resultado => {
        alert(result)
      })
      .catch(error => {
         console.log(error);
        });
        CargarAdmi();
  }
  function ArmarProductos(resultado){
    var html="   <table class='table table-dark table-striped' style='width:100%'>"+
    "<tr>"+
        "<th>Nombre</th>"+       
        "<th>Precio</th>"+       
        "<th>Descripcion</th>"+       
    "</tr>";
    resultado.forEach(element => {
      html +=
      "<tr>" +
      "<td>"+element.nombre+"</td>" +      
      "<td>"+element.precio+"</td>" +      
      "<td>"+element.descripcion+"</td>" +      
      "<td><button type='button' class='btn btn-danger' onclick='EliminarProducto(\""+element.id+"\")'>Eliminar</button></td>"+      
      "<td><button type='button' class='btn btn-danger' data-toggle='modal' data-target='#CrearProductoModal' onclick='ArmarActualizarProducto(\""+element.id+"\")'>Actualizar Producto</button></td>"+      
      "</tr>";
    });  
    document.getElementById("Productos").innerHTML=html+"</table>";
  }
  function ArmarActualizarProducto(id){
    
    document.getElementById("btnAgregar_Crear").innerHTML="<button type='button' class='btn btn-primary' data-dismiss='modal' onclick='ActualizarProducto("+id+")'>Agregar</button>";;
    document.getElementById("Titulo").innerHTML="<h5 class='modal-title' id='exampleModalLabel'>Actualizar Producto</h5>";
  }
  function ArmarAgregarProducto(){    
    document.getElementById("btnAgregar_Crear").innerHTML="<button type='button' class='btn btn-primary' data-dismiss='modal' onclick='AgregarProducto()'>Agregar</button>";
    document.getElementById("Titulo").innerHTML= "<h5 class='modal-title' id='exampleModalLabel'>Crear Producto</h5>";
  }
  async function EliminarProducto(id){
    var opciones = {
      method: 'DELETE'
    };
    await fetch("http://localhost:5000/Producto?Id="+id, opciones)
      .then(response => response.json())
      .then(resultado => {
        console.log(resultado);      
      })
      .catch(error => {
         console.log(error);          
        });
        CargarAdmi();
  }
  async function OptenerProductoPorID(ID){
    var objeto;
    var opciones = {
      method: 'GET'
    };
    await fetch("http://localhost:5000/Producto/OptenerProductoPorID?Id="+ID, opciones)
      .then(response => response.json())
      .then(resultado => {
      objeto= resultado;
      })
      .catch(error => {
         console.log(error);          
        });
        return objeto;
}
function ObtenerNombre(id){
  var respuesta;
  productos.forEach(element => {
    if(element.id==id)
      respuesta=element;      
  });
  if(respuesta==undefined){
    respuesta="¡El producto ya no se encuentra en la base de datos!"
  }else{
    respuesta=respuesta.nombre
  }
  return respuesta;
}
function ObtenerPrecio(id){
  var respuesta;
  productos.forEach(element => {
    if(element.id==id)
      respuesta=element.precio;      
  });
  return respuesta;
}
function ObtenerIDs(){
  let respuesta=[];
  productos.forEach(element => {    
      respuesta.push(element.id)    
  });
  return respuesta;
}
function ObtenerPrecio(id){
  var respuesta;
  productos.forEach(element => {    
    if(element.id==id)
      respuesta=element.precio;
  });
  return respuesta;
}
function ObtenerDescripcion(id){
  var respuesta;
  productos.forEach(element => {    
    if(element.idProducto==id)
      respuesta=element.descripcion;
  });
  return respuesta;
}
async function EliminarPedido(id){
  var opciones = {
    method: 'DELETE'
  };
  await fetch("http://localhost:5000/Pedido?Id="+id, opciones)
    .then(response => response.json())
    .then(resultado => {
      console.log(resultado);      
    })
    .catch(error => {
       console.log(error);          
      });
  CargarAdmi();
  var opciones = {
    method: 'DELETE'
  };
  CargarAdmi();
}