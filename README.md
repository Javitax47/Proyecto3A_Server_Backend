# Sensor Management API

Este proyecto es una API para gestionar usuarios y sensores utilizando Node.js y PostgreSQL. Permite la creación, consulta, inserción y eliminación de datos de sensores, así como la administración de usuarios.

## Tabla de Contenidos

- [Características](#características)
- [Tecnologías Usadas](#tecnologías-usadas)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Requisitos Previos](#requisitos-previos)
- [Configuración del Entorno](#configuración-del-entorno)
- [Uso](#uso)
- [API Endpoints](#api-endpoints)
- [Contribuciones](#contribuciones)
- [Licencia](#licencia)

## Características

- Gestión de usuarios: crear, listar y eliminar usuarios.
- Gestión de sensores: agregar, listar y eliminar mediciones de sensores.
- API RESTful para interactuar con los datos.
- Base de datos PostgreSQL para almacenamiento persistente.
- Contenerización con Docker.

## Tecnologías Usadas

- Node.js
- Express
- PostgreSQL
- Docker
- Docker Compose

## Estructura del Proyecto

    ```
    /backend
        - db.js # Configuración de la conexión a la base de datos.
        - server.js # Código principal de la API.
        - Dockerfile # Archivo para construir la imagen Docker de la aplicación.
        - docker-compose.yml # Archivo de configuración para Docker Compose.
        - package.json # Dependencias y scripts de la aplicación.
        - README.md # Documentación del proyecto.
    ```

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalados los siguientes programas:

- [Node.js](https://nodejs.org/)
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

## Configuración del Entorno

1. Clona el repositorio:

    ```
    git clone https://github.com/tu_usuario/sensor-management-api.git
    cd sensor-management-api
    ```

2. Construye y ejecuta los contenedores:

    ```
    docker-compose up --build
    ```

Esto levantará los contenedores para la base de datos y la aplicación.

 ## Uso

Una vez que los contenedores estén en funcionamiento, la API estará disponible en http://localhost:13000.

 ## API Endpoints

- GET /setup: Crea las tablas de usuarios y sensores en la base de datos.
- GET /latest: Obtiene las últimas mediciones de temperatura y Ozono.
- GET /: Devuelve todos los usuarios y sensores.
- POST /: Inserta un nuevo sensor.
    - Body: { "type": "temperature", "value": 25.5, "timestamp": "2024-09-22T12:00:00Z", "userId": 1 }
- POST /users: Crea un nuevo usuario.
    - Body: { "username": "nuevo_usuario" }
- DELETE /users/:id/measurements: Elimina todas las mediciones de un usuario específico.
- DELETE /reset: Reinicia las tablas de la base de datos.
- DELETE /erase: Elimina todas las tablas.

 ## Contribuciones

Las contribuciones son bienvenidas. Si deseas contribuir a este proyecto, por favor abre un issue o envía un pull request.

 ## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo LICENSE para más información.
