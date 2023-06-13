# Usa la imagen base de Node.js
FROM node:14

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia el archivo package.json y package-lock.json a la ubicación de trabajo
COPY package*.json ./

# Instala las dependencias del proyecto
RUN npm install

# Copia el código fuente de la aplicación a la ubicación de trabajo
COPY . .

# Expone el puerto en el que se ejecutará la aplicación
EXPOSE 3000

# Comando que se ejecutará dentro del contenedor para iniciar la aplicación
CMD [ "npm", "start" ]
