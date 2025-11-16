# 🚀 Guía de Subida a GitHub

## 📋 Pre-requisitos

- [x] Git instalado
- [x] Cuenta de GitHub
- [ ] Repositorio creado en GitHub

---

## 🔧 Paso 1: Verificar Git

```bash
# Verificar que Git esté instalado
git --version

# Configurar usuario (si no lo has hecho)
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

---

## 📦 Paso 2: Crear Repositorio en GitHub

1. Ir a https://github.com/new
2. Nombre del repositorio: `alerta-utec-frontend`
3. Descripción: `Sistema de Gestión de Incidentes - UTEC`
4. Público o Privado (según preferencia)
5. **NO** inicializar con README, .gitignore, o license (ya los tenemos)
6. Click en "Create repository"

---

## 🔀 Paso 3: Inicializar Git Local (si no está inicializado)

```bash
# Ir a la carpeta del proyecto
cd "/Users/mathias/Desktop/CICLO 4/Cloud/Hack Gonzo/Frontend"

# Verificar si ya hay un repositorio git
git status

# Si NO hay repositorio, inicializar
git init

# Verificar que .gitignore existe
cat .gitignore
```

---

## 📝 Paso 4: Preparar Archivos

```bash
# Ver qué archivos se van a subir (verificar que node_modules y dist NO aparezcan)
git status

# Añadir todos los archivos
git add .

# Verificar cambios
git status

# Debería mostrar:
# - package.json
# - src/
# - public/
# - .gitignore
# - etc.
# 
# NO debería incluir:
# - node_modules/
# - dist/
# - .env
```

---

## 💾 Paso 5: Primer Commit

```bash
# Hacer el primer commit
git commit -m "feat: initial commit - Alerta UTEC Frontend v1.0"

# Verificar el commit
git log --oneline
```

---

## 🔗 Paso 6: Conectar con GitHub

```bash
# Añadir el repositorio remoto
# Reemplaza TU-USUARIO con tu nombre de usuario de GitHub
git remote add origin https://github.com/TU-USUARIO/alerta-utec-frontend.git

# O si usas SSH
git remote add origin git@github.com:TU-USUARIO/alerta-utec-frontend.git

# Verificar
git remote -v
```

---

## 🚀 Paso 7: Subir al Repositorio

```bash
# Cambiar nombre de rama a 'main' (si es necesario)
git branch -M main

# Subir código
git push -u origin main

# Si te pide autenticación:
# - Usuario: tu-usuario-github
# - Contraseña: usa un Personal Access Token (no tu contraseña)
```

### Crear Personal Access Token (si es necesario)

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token (classic)
3. Seleccionar: `repo` (acceso completo)
4. Generate token
5. **Copiar el token** (no podrás verlo de nuevo)
6. Usar este token como contraseña al hacer push

---

## ✅ Paso 8: Verificar

1. Ir a tu repositorio en GitHub: `https://github.com/TU-USUARIO/alerta-utec-frontend`
2. Verificar que todos los archivos estén ahí
3. Verificar que NO estén node_modules/ ni dist/
4. Verificar que el README.md se muestre correctamente

---

## 🔄 Comandos para Actualizaciones Futuras

```bash
# Ver cambios
git status

# Añadir cambios
git add .

# Commit con mensaje descriptivo
git commit -m "feat: agregar nueva funcionalidad"

# Subir cambios
git push origin main
```

---

## 📚 Comandos de Git Útiles

```bash
# Ver historial
git log --oneline --graph

# Ver cambios en archivos
git diff

# Deshacer cambios NO commiteados
git checkout -- archivo.txt

# Deshacer último commit (mantiene cambios)
git reset --soft HEAD~1

# Ver ramas
git branch

# Crear y cambiar a nueva rama
git checkout -b feature/nueva-funcionalidad

# Cambiar de rama
git checkout main

# Merge de rama
git merge feature/nueva-funcionalidad

# Eliminar rama local
git branch -d feature/nueva-funcionalidad

# Actualizar desde GitHub
git pull origin main
```

---

## 🛡️ Verificación de Seguridad

Antes de subir, asegúrate de que estos archivos **NO** estén en tu repositorio:

- [ ] `.env` (contiene API keys)
- [ ] `node_modules/` (muy pesado)
- [ ] `dist/` (build output)
- [ ] `.DS_Store` (archivos de macOS)
- [ ] `*.log` (archivos de log)

Si accidentalmente subiste un archivo sensible:

```bash
# Eliminar del repositorio (pero mantener local)
git rm --cached .env

# Commit del cambio
git commit -m "chore: remove .env from repository"

# Push
git push origin main

# Añadir a .gitignore para prevenir futuros errores
echo ".env" >> .gitignore
git add .gitignore
git commit -m "chore: add .env to gitignore"
git push origin main
```

---

## 🔧 Solución de Problemas

### Error: "Repository not found"
```bash
# Verificar URL del remoto
git remote -v

# Corregir URL si es necesario
git remote set-url origin https://github.com/TU-USUARIO-CORRECTO/alerta-utec-frontend.git
```

### Error: "Permission denied"
```bash
# Si usas HTTPS, usa Personal Access Token como contraseña
# Si usas SSH, verifica que tu clave SSH esté añadida:
ssh -T git@github.com
```

### Error: "Updates were rejected"
```bash
# Primero hacer pull
git pull origin main

# Si hay conflictos, resolverlos manualmente

# Luego hacer push
git push origin main
```

---

## 🎉 ¡Listo!

Tu proyecto está ahora en GitHub y listo para:
- ✅ Compartir con el equipo
- ✅ Desplegar en Netlify/Vercel
- ✅ Colaborar con otros desarrolladores
- ✅ Hacer backup automático

---

**Siguiente paso:** Configura GitHub Actions para CI/CD o despliega en Netlify/Vercel.
