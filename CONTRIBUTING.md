# 🤝 Guía de Contribución

Gracias por tu interés en contribuir a Alerta UTEC!

## 📋 Tabla de Contenidos

- [Configuración del Entorno](#configuración-del-entorno)
- [Flujo de Trabajo](#flujo-de-trabajo)
- [Estándares de Código](#estándares-de-código)
- [Commits](#commits)
- [Pull Requests](#pull-requests)

---

## 🛠️ Configuración del Entorno

### 1. Fork y Clone

```bash
# Fork el repositorio en GitHub
# Luego clona tu fork
git clone https://github.com/TU-USUARIO/alerta-utec-frontend.git
cd alerta-utec-frontend

# Añade el repositorio original como upstream
git remote add upstream https://github.com/USUARIO-ORIGINAL/alerta-utec-frontend.git
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

```bash
cp .env.example .env
# Edita .env con tus configuraciones
```

### 4. Iniciar Desarrollo

```bash
npm run dev
```

---

## 🔄 Flujo de Trabajo

### 1. Crear una Rama

```bash
# Actualizar main
git checkout main
git pull upstream main

# Crear nueva rama
git checkout -b feature/nombre-descriptivo
# o
git checkout -b fix/nombre-del-bug
```

### 2. Hacer Cambios

- Escribe código limpio y documentado
- Sigue los estándares de código del proyecto
- Prueba tus cambios localmente

### 3. Commit

```bash
git add .
git commit -m "feat: descripción clara del cambio"
```

### 4. Push y Pull Request

```bash
git push origin feature/nombre-descriptivo
```

Luego crea un Pull Request en GitHub.

---

## 📝 Estándares de Código

### TypeScript

- ✅ Usa tipos explícitos, evita `any`
- ✅ Interfaces para objetos complejos
- ✅ Enums para valores fijos

```typescript
// ✅ Bueno
interface User {
  id: string;
  name: string;
  role: UserRole;
}

// ❌ Malo
const user: any = { ... };
```

### React

- ✅ Componentes funcionales con hooks
- ✅ Props tipadas con interfaces
- ✅ Usa `React.FC` para componentes

```typescript
interface Props {
  title: string;
  onSubmit: () => void;
}

export const MyComponent: React.FC<Props> = ({ title, onSubmit }) => {
  // ...
};
```

### CSS/Tailwind

- ✅ Usa Tailwind CSS cuando sea posible
- ✅ Classes ordenadas: layout → spacing → colors → text
- ✅ Usa clases de utilidad, no inline styles

```typescript
// ✅ Bueno
<div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-lg">

// ❌ Malo
<div style={{ display: 'flex', padding: '16px' }}>
```

### Nombres

- ✅ Componentes: `PascalCase` (ej: `IncidentCard.tsx`)
- ✅ Archivos de utilidades: `camelCase` (ej: `formatDate.ts`)
- ✅ Constantes: `UPPER_CASE` (ej: `API_BASE_URL`)
- ✅ Funciones: `camelCase` (ej: `getUserData`)

---

## 💬 Commits

### Formato

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>(<alcance>): <descripción>

[cuerpo opcional]

[footer opcional]
```

### Tipos

- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Cambios de formato (no afectan código)
- `refactor`: Refactorización de código
- `test`: Añadir o modificar tests
- `chore`: Tareas de mantenimiento

### Ejemplos

```bash
feat(auth): agregar login con Google
fix(dashboard): corregir filtro de fecha
docs(readme): actualizar instrucciones de instalación
style(components): formatear código con prettier
refactor(api): simplificar cliente de axios
```

---

## 🔍 Pull Requests

### Antes de Crear un PR

- [ ] El código compila sin errores (`npm run build`)
- [ ] Pasa el linter (`npm run lint`)
- [ ] Los tipos de TypeScript son correctos (`npx tsc --noEmit`)
- [ ] Probado localmente

### Plantilla de PR

```markdown
## Descripción
Breve descripción de los cambios

## Tipo de Cambio
- [ ] 🐛 Bug fix
- [ ] ✨ Nueva funcionalidad
- [ ] 🔨 Refactorización
- [ ] 📝 Documentación

## Checklist
- [ ] El código compila
- [ ] Pasa el linter
- [ ] Probado localmente
- [ ] Documentación actualizada (si aplica)

## Capturas de Pantalla
(si aplica)
```

---

## ❓ Preguntas

Si tienes preguntas, puedes:
- Abrir un Issue en GitHub
- Contactar al equipo de desarrollo

---

**¡Gracias por contribuir! 🚀**
