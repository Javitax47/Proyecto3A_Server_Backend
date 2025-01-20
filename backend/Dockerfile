# @file Dockerfile
# @brief Definición del contenedor para la aplicación Node.js.
#
# Este archivo Dockerfile se utiliza para construir una imagen Docker
# que ejecuta una aplicación Node.js.

# @brief Imagen base utilizada para el contenedor.
FROM node:16 
# Utiliza la imagen oficial de Node.js en la versión 16.

# @brief Directorio de trabajo dentro del contenedor.
WORKDIR /usr/src/app 
# Establece el directorio de trabajo donde se copiarán los archivos de la aplicación.

# @brief Copia los archivos de configuración de dependencias.
COPY package*.json ./ 
# Copia los archivos package.json y package-lock.json al directorio de trabajo.

# @brief Instala las dependencias de la aplicación.
RUN npm install 
# Ejecuta npm install para instalar las dependencias declaradas en package.json.

# @brief Copia todos los archivos del proyecto al contenedor.
COPY . . 
# Copia el contenido del directorio del proyecto al directorio de trabajo del contenedor.

# @brief Expone el puerto 1337.
EXPOSE 1337 
# Indica que el contenedor escucha en el puerto 1337 para el tráfico entrante.

# @brief Comando predeterminado para ejecutar la aplicación.
CMD ["npm", "run", "dev"] 
# Ejecuta el script dev definido en package.json cuando se inicia el contenedor.