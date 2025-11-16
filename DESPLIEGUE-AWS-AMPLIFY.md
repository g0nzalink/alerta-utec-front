# 🚀 Guía de Despliegue en AWS Amplify

Esta guía te ayudará a desplegar **Alerta UTEC** en AWS Amplify.

## 📋 Prerequisitos

- Cuenta de AWS
- Repositorio Git (GitHub, GitLab o Bitbucket) con tu código
- Acceso a AWS Amplify Console

## 🔧 Archivos de Configuración Creados

Ya se han creado los siguientes archivos necesarios para el despliegue:

1. **`amplify.yml`** - Configuración de build para AWS Amplify
2. **`public/_redirects`** - Manejo de rutas para React Router

## 📝 Pasos para Desplegar

### Paso 1: Subir los archivos de configuración a tu repositorio

```bash
git add amplify.yml public/_redirects
git commit -m "feat: add AWS Amplify configuration files"
git push origin main
```

### Paso 2: Acceder a AWS Amplify Console

1. Inicia sesión en [AWS Console](https://console.aws.amazon.com/)
2. Busca y selecciona **AWS Amplify** en la barra de búsqueda
3. Haz clic en **"Get Started"** o **"New app"**
4. Selecciona **"Host web app"**

### Paso 3: Conectar tu Repositorio

1. Selecciona tu proveedor de Git (GitHub, GitLab, Bitbucket, etc.)
2. Autoriza a AWS Amplify para acceder a tu repositorio
3. Selecciona el repositorio: **alerta-utec-front**
4. Selecciona la rama: **main** (o la que prefieras)
5. Haz clic en **"Next"**

### Paso 4: Configurar el Build

AWS Amplify debería detectar automáticamente el archivo `amplify.yml`. Si no lo hace, pega la siguiente configuración:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### Paso 5: Configurar Variables de Entorno

En la sección de **"Environment variables"**, agrega las siguientes variables:

| Clave | Valor | Descripción |
|-------|-------|-------------|
| `VITE_API_BASE_URL` | `https://m8iy12chv2.execute-api.us-east-1.amazonaws.com/dev` | URL de tu API backend |
| `VITE_WS_URL` | `wss://rgs5nn9vgf.execute-api.us-east-1.amazonaws.com/dev` | URL de WebSocket |
| `VITE_APP_ENV` | `production` | Entorno de la aplicación |

**Nota:** Si tienes otros endpoints de API, asegúrate de actualizarlos aquí.

### Paso 6: Configurar la Aplicación

1. **App name**: `alerta-utec` (o el nombre que prefieras)
2. **Environment name**: `production`
3. Habilita el **Automatic builds** para despliegues automáticos en cada push
4. Haz clic en **"Next"**

### Paso 7: Revisar y Desplegar

1. Revisa toda la configuración
2. Haz clic en **"Save and deploy"**
3. AWS Amplify comenzará a:
   - Provisionar los recursos
   - Clonar tu repositorio
   - Instalar dependencias
   - Construir la aplicación
   - Desplegarla en la CDN de AWS

⏱️ **Tiempo estimado**: 5-10 minutos

### Paso 8: Acceder a tu Aplicación

Una vez completado el despliegue, AWS Amplify te proporcionará una URL similar a:

```
https://main.d1234abcd5678e.amplifyapp.com
```

## 🌐 Configurar Dominio Personalizado (Opcional)

### Opción A: Dominio de AWS Route 53

1. En la consola de Amplify, ve a **"Domain management"**
2. Haz clic en **"Add domain"**
3. Si tienes un dominio en Route 53, selecciónalo
4. Amplify configurará automáticamente los registros DNS

### Opción B: Dominio Externo

1. En la consola de Amplify, ve a **"Domain management"**
2. Haz clic en **"Add domain"**
3. Ingresa tu dominio (ej: `alerta.utec.edu.pe`)
4. Amplify te proporcionará registros DNS para configurar en tu proveedor
5. Agrega estos registros en tu proveedor de dominio:
   - Registro CNAME o A según las instrucciones
6. Espera la propagación DNS (puede tomar hasta 48 horas)

## 🔒 Configurar HTTPS

AWS Amplify proporciona certificados SSL/TLS gratuitos automáticamente mediante AWS Certificate Manager (ACM).

## 🔄 Despliegues Automáticos

Cada vez que hagas `git push` a la rama configurada, AWS Amplify automáticamente:

1. Detectará los cambios
2. Ejecutará el build
3. Desplegará la nueva versión
4. Mantendrá las versiones anteriores para rollback si es necesario

## 🔍 Monitoreo y Logs

En la consola de AWS Amplify puedes:

- Ver el estado de los builds
- Revisar logs de construcción
- Monitorear el tráfico
- Ver métricas de rendimiento
- Acceder a versiones anteriores

## 🐛 Troubleshooting

### Error: "Build failed"

1. Revisa los logs de build en la consola de Amplify
2. Verifica que todas las variables de entorno estén configuradas
3. Asegúrate de que `package.json` tenga los scripts correctos

### Error: "Page not found" en rutas

Si obtienes errores 404 al navegar directamente a rutas (ej: `/dashboard`), verifica que el archivo `public/_redirects` exista con el contenido:

```
/*    /index.html   200
```

### Variables de entorno no funcionan

- Asegúrate de que las variables comiencen con `VITE_`
- Después de agregar variables, debes hacer un nuevo deploy
- Verifica que uses `import.meta.env.VITE_VARIABLE_NAME` en tu código

### Error de CORS en producción

Si tienes errores de CORS:

1. Verifica que tu API backend permita el dominio de Amplify
2. Actualiza las configuraciones de CORS en tu API Gateway
3. Agrega el dominio de Amplify a la whitelist

## 💰 Costos Estimados

AWS Amplify tiene una capa gratuita generosa:

- **1000 minutos de build** al mes (gratis)
- **15 GB de data servida** al mes (gratis)
- **5 GB de storage** al mes (gratis)

Después de eso, los costos son:
- Build: $0.01 por minuto
- Data servida: $0.15 por GB
- Storage: $0.023 por GB-mes

## 📊 Configuración Adicional Recomendada

### Redireccionamiento HTTPS (ya incluido por defecto)

AWS Amplify automáticamente redirige HTTP a HTTPS.

### Compresión Brotli (ya incluida)

AWS Amplify usa compresión Brotli automáticamente para mejor rendimiento.

### Cache Headers

Para optimizar el cache, puedes agregar en `amplify.yml`:

```yaml
frontend:
  phases:
    # ... configuración existente
  customHeaders:
    - pattern: '**/*'
      headers:
        - key: 'Cache-Control'
          value: 'public, max-age=31536000, immutable'
    - pattern: '/index.html'
      headers:
        - key: 'Cache-Control'
          value: 'no-cache'
```

## 🔐 Seguridad

### Autenticación Básica (Opcional)

Si quieres proteger tu sitio con usuario/contraseña mientras está en desarrollo:

1. Ve a **"Access control"** en la consola de Amplify
2. Habilita **"Basic authentication"**
3. Crea usuario y contraseña

### Variables de Entorno Secretas

Para variables sensibles:

1. Usa AWS Systems Manager Parameter Store
2. Referencia los parámetros en `amplify.yml`
3. Amplify los resolverá durante el build

## 📚 Recursos Adicionales

- [Documentación de AWS Amplify](https://docs.aws.amazon.com/amplify/)
- [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
- [Pricing de AWS Amplify](https://aws.amazon.com/amplify/pricing/)

## ✅ Checklist de Despliegue

- [ ] Archivos `amplify.yml` y `public/_redirects` creados
- [ ] Código subido a repositorio Git
- [ ] Repositorio conectado a AWS Amplify
- [ ] Variables de entorno configuradas
- [ ] Build exitoso
- [ ] Aplicación accesible desde URL de Amplify
- [ ] Rutas de React Router funcionando correctamente
- [ ] API backend accesible desde producción
- [ ] WebSocket conectando correctamente
- [ ] (Opcional) Dominio personalizado configurado
- [ ] (Opcional) Autenticación básica si es necesario

## 🎉 ¡Listo!

Tu aplicación **Alerta UTEC** ahora está desplegada en AWS Amplify con:

- ✅ HTTPS automático
- ✅ CDN global de AWS CloudFront
- ✅ Despliegues automáticos en cada push
- ✅ Rollback fácil a versiones anteriores
- ✅ Monitoreo y logs integrados
- ✅ Escalabilidad automática

---

**Última actualización**: 16 de noviembre de 2025
