const express = require("express");
const cors = require("cors");
const sql = require("mssql");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json()); // Agregar middleware para analizar el cuerpo de la solicitud como JSON
const port = 3000;

// Configuración de conexión a la base de datos
const config = {
  server: "50.19.27.158",
  user: "Pmuser",
  password: "$ecret@806.",
  database: "PADRON",
  options: {
    trustServerCertificate: true, // Establecer en true para permitir certificados autofirmados
    requestTimeout: 30000,
  },
};

// Configuración de los encabezados CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Crear un nuevo seguimiento
app.post("/seguimientos", async (req, res) => {
  const nuevoSeguimiento = req.body;
  try {
    await sql.connect(config);
    const result = await sql.query(
      `INSERT INTO Seguimientos (NivelAceptacion, ViaContacto, Comentario)
       VALUES ('${nuevoSeguimiento.nivelAceptacion}', '${nuevoSeguimiento.viaContacto}', '${nuevoSeguimiento.comentario}')`
    );
    res.status(201).json(nuevoSeguimiento);
  } catch (error) {
    console.error("Error en la consulta:", error.message);
    res.status(500).send("Error en la consulta");
  } finally {
    await sql.close();
  }
});
//Traer los seguimientos
app.get("/seguimientos", async (req, res) => {
  try {
    await sql.connect(config);
    const result = await sql.query(
      "SELECT comentario, nivelAceptacion, viaContacto FROM Seguimientos"
    );
    res.json(result.recordset);
  } catch (error) {
    console.error("Error en la consulta:", error.message);
    res.status(500).send("Error en la consulta");
  } finally {
    await sql.close();
  }
});
// Actualizar un seguimiento existente
app.put("/seguimientos/:id", async (req, res) => {
  const seguimientoId = req.params.id;
  const seguimientoActualizado = req.body;
  try {
    await sql.connect(config);
    const result = await sql.query(
      `UPDATE Seguimientos
       SET NivelAceptacion = '${seguimientoActualizado.nivelAceptacion}',
           ViaContacto = '${seguimientoActualizado.viaContacto}',
           Comentario = '${seguimientoActualizado.comentario}'
       WHERE Id = '${seguimientoId}'`
    );
    res.json(seguimientoActualizado);
  } catch (error) {
    console.error("Error en la consulta:", error.message);
    res.status(500).send("Error en la consulta");
  } finally {
    await sql.close();
  }
});

// Eliminar un seguimiento
app.delete("/seguimientos/:id", async (req, res) => {
  const seguimientoId = req.params.id;
  try {
    await sql.connect(config);
    const result = await sql.query(
      `DELETE FROM Seguimientos WHERE Id = '${seguimientoId}'`
    );
    res.sendStatus(204);
  } catch (error) {
    console.error("Error en la consulta:", error.message);
    res.status(500).send("Error en la consulta");
  } finally {
    await sql.close();
  }
});

// Obtener todos los usuarios
app.get("/users", async (req, res) => {
  try {
    await sql.connect(config);
    const result = await sql.query("SELECT * FROM [user]");
    res.json(result.recordset);
  } catch (error) {
    console.error("Error en la consulta:", error.message);
    res.status(500).send("Error en la consulta");
  } finally {
    await sql.close();
  }
});

// Obtener un usuario por su UserId
app.get("/users/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    await sql.connect(config);
    const result = await sql.query(
      `SELECT * FROM [user] WHERE UserId = '${userId}'`
    );
    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).json({ error: "Usuario no encontrado" });
    }
  } catch (error) {
    console.error("Error en la consulta:", error.message);
    res.status(500).send("Error en la consulta");
  } finally {
    await sql.close();
  }
});

// Crear un nuevo usuario
app.post("/users", async (req, res) => {
  const newUser = req.body;
  try {
    await sql.connect(config);
    const result = await sql.query(
      `INSERT INTO [user] (UserId, Password, Isactive, Code, Email)
       VALUES (NEWID(), '${newUser.Password}', '${newUser.Isactive}', '${newUser.Code}', '${newUser.Email}')`
    );
    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error en la consulta:", error.message);
    res.status(500).send("Error en la consulta");
  } finally {
    await sql.close();
  }
});

// Actualizar un usuario existente
app.put("/users/:id", async (req, res) => {
  const userId = req.params.id;

  const updatedUser = req.body;
  try {
    await sql.connect(config);
    const result = await sql.query(
      `UPDATE [user]
       SET Password = '${updatedUser.Password}',
           Isactive = '${updatedUser.Isactive}',
           Code = '${updatedUser.Code}',
           Email = '${updatedUser.Email}'
       WHERE UserId = '${userId}'`
    );
    res.json(updatedUser);
  } catch (error) {
    console.error("Error en la consulta:", error.message);
    res.status(500).send("Error en la consulta");
  } finally {
    await sql.close();
  }
});

// Eliminar un usuario
app.delete("/users/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    await sql.connect(config);
    const result = await sql.query(
      `DELETE FROM [user] WHERE UserId = '${userId}'`
    );
    res.sendStatus(204);
  } catch (error) {
    console.error("Error en la consulta:", error.message);
    res.status(500).send("Error en la consulta");
  } finally {
    await sql.close();
  }
});

// Endpoint para la consulta de la cédula
app.get("/consulta/:cedula", async (req, res) => {
  const cedula = req.params.cedula;

  try {
    await sql.connect(config);

    const query = `SELECT TOP 1 p.IdProvincia, pro.Descripcion AS Provincia, p.IdMunicipio, m.Descripcion AS Municipio,
                          p.CodigoCircunscripcion, p.CodigoRecinto, p.CodigoColegio, p.Cedula, p.nombres,
                          p.apellido1, p.apellido2, p.FechaNacimiento, p.IdSexo, sx.Descripcion AS Sexo,
                          p.IdEstadoCivil, p.ColegioOrigen, co.Descripcion
                   FROM PADRON.dbo.PADRON p
                   LEFT JOIN Provincia pro ON p.IdProvincia = pro.Id
                   LEFT JOIN Municipio m ON p.IdMunicipio = m.Id
                   LEFT JOIN Circunscripcion c ON p.CodigoCircunscripcion = c.CodigoCircunscripcion
                   LEFT JOIN Recinto r ON p.CodigoRecinto = r.CodigoRecinto
                   LEFT JOIN Colegio co ON p.CodigoColegio = co.CodigoColegio
                   LEFT JOIN Sexo sx ON p.IdSexo = sx.IdSexo
                   WHERE p.Cedula = '${cedula}'`;

    const result = await sql.query(query);

    res.json(result.recordset);
  } catch (error) {
    console.error("Error en la consulta:", error.message);
    res.status(500).send("Error en la consulta");
  } finally {
    await sql.close();
  }
});

// Endpoint de login
app.post("/login", async (req, res) => {
  const { Email, password } = req.body;
  try {
    await sql.connect(config);
    const result = await sql.query(
      `SELECT * FROM [user] WHERE Email = '${Email}' AND Password = '${password}'`
    );

    if (result.recordset.length === 0) {
      res.status(401).json({ error: "Credenciales inválidas" });
    } else {
      // Generar un token JWT con una duración de 1 hora
      const token = jwt.sign({ Email }, "secretKey", { expiresIn: "1h" });
      res.json({ token });
    }
  } catch (error) {
    res.status(500).send("Error en la consulta");
  } finally {
    await sql.close();
  }
});

// Middleware para verificar el token en rutas protegidas
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, "secretKey", (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Ruta protegida
app.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: "Ruta protegida" });
});

// Iniciar el servidor
app
  .listen(port, () => {
    console.log(`Servidor API escuchando en http://localhost:${port}`);
  })
  .on("error", (err) => {
    console.error("Error al iniciar el servidor:", err.message);
  });
