# Requisitos para la implementación de Jenkins

## Objetivo
Entregar las características y requisitos necesarios para implementar Jenkins como gestor de Integración Continua (CI) y despliegue (CD) para el proyecto SST_Report.

## Alcance
- Jenkins en modalidad centralizada (master/controller) con agentes (build agents) para ejecutar pipelines.
- Integración con: repositorio Git, Docker (registry), servidor de artefactos si aplica, y notificaciones (correo/Slack).
- Pipelines declarativos en `Jenkinsfile` almacenados en los repositorios.

## Requisitos de infraestructura
- Topología mínima:
  - 1 nodo Controller (Jenkins LTS).
  - N nodos Agents (linux) según concurrencia esperada.
- Hardware recomendado (por nodo Controller):
  - CPU: 4 vCPUs
  - RAM: 8–16 GB (más si se usan muchos plugins/peers)
  - Almacenamiento: 100 GB (logs, workspace, artefactos temporales)
  - Disco: SSD recomendado
- Red:
  - Acceso desde/ hacia repositorios Git (puede ser GitHub/GitLab/Bitbucket)
  - Acceso a Docker registry (Docker Hub o privado) por parte de los agents
  - Puertos: `8080` (HTTP, configurable), `50000` (JNLP agents), y `443` si se habilita HTTPS

## Requisitos de software
- Java JDK/JRE soportado por la versión de Jenkins LTS (OpenJDK 17 suele ser requerido en versiones recientes).
- Jenkins LTS (versión estable y soportada por la organización).
- Docker Engine instalado en agentes que construyan imágenes (si se usan builders Docker).
- Git cliente en controladora y/o agentes.
- (Opcional) Kubernetes cluster si se utiliza `kubernetes-plugin` para agentes dinámicos.

## Plugins recomendados
- Pipeline (workflow-aggregator)
- Blue Ocean (opcional, UI)
- Git / GitHub / GitLab plugin (según proveedor)
- Credentials Binding
- Docker Pipeline
- Kubernetes plugin (si aplica)
- Credentials and Role-based Authorization Strategy / Matrix-based security
- GitHub Branch Source / Multibranch Pipeline
- Mailer / Slack Notification
- Job DSL (opcional)
- NodeJS, Maven, or Python build plugins según stack

## Seguridad y acceso
- Habilitar HTTPS en el controller (certificados válidos).
- Autenticación central (LDAP/AD/SSO) o cuentas locales con MFA cuando sea posible.
- Autorización por roles (RBAC) — separar administradores de usuarios-developers.
- Guardar credenciales sensibles en el store de `Credentials` (no en repositorios).
- Restricciones de sandbox en pipelines donde sea requerido.
- Auditoría y rotación periódica de credenciales.

## Almacenamiento y persistencia
- `JENKINS_HOME` en volumen persistente (host volume o volumen de red/CSI).
- Backups regulares de `JENKINS_HOME` (config, jobs, credentials) y del repositorio de artefactos.
- Mantener rotación de logs y limpieza de `workspace` en jobs.

## Resiliencia y escalabilidad
- Plan de recuperación (backup + restore) documentado y probado.
- Uso de agentes dinámicos (Kubernetes) o escalado horizontal de agentes para aumentar concurrencia.
- Monitoreo de métricas JVM y del contenedor Jenkins.

## Integración con Docker y despliegue
- Configurar `Docker Pipeline` para build/push de imágenes.
- Agents con privilegios para ejecutar Docker (Docker-in-Docker o socket bind - evaluar seguridad).
- Recomiendo usar agentes con Docker instalado y construir imágenes con tags por commit/branch.

## Monitorización y alertas
- Integrar con Prometheus/Grafana o usar el plugin `metrics` para exponer métricas.
- Alertas por: caída del controller, cola de builds elevada, disco lleno, errores repetidos en pipelines.

## Backups y mantenimiento
- Backups diarios de `JENKINS_HOME` y retención de X días (p. ej. 30 días).
- Procedimiento de actualización de Jenkins (staging primero, luego producción).
- Lista de plugins aprobados y versionado controlado.

## Pipelines y buenas prácticas
- Usar `Jenkinsfile` en repositorios (Multibranch Pipeline).
- Pipeline declarativo con etapas claras: `checkout`, `build`, `test`, `package`, `publish`.
- Uso de etapas de `post` para notificaciones y limpieza.
- Control de versiones para imágenes y artefactos.
- Pruebas automáticas y gates (QA manual opcional en `input` step) antes de despliegue a producción.

## Gestión de secretos
- Almacenar secretos en `Credentials` o integrar HashiCorp Vault/Sealed Secrets.
- No escribir secretos en logs; usar `credentialsBinding` para evitar exposición.

## Integración con herramientas externas
- Git provider: acceso con SSH keys o token
- Registry Docker: credenciales en `Credentials`
- Notificaciones: Slack, correo
- Artifact repository (opcional): Nexus, Artifactory

## Checklist de implementación (pasos mínimos)
1. Provisión del servidor (VM o contenedor) para Jenkins Controller.
2. Instalar Java, crear usuario `jenkins` y configurar `JENKINS_HOME` en volumen persistente.
3. Instalar Jenkins LTS y sólo los plugins iniciales.
4. Configurar HTTPS y autenticación (LDAP/AD/SSO).
5. Configurar `Credentials` y políticas de acceso.
6. Registrar agentes (o configurar Kubernetes plugin para agentes dinámicos).
7. Crear proyectos Multibranch para repositorios principales y validar `Jenkinsfile`.
8. Configurar builds de ejemplo (build, test, push to registry).
9. Automatizar backups y configurar monitorización.
10. Documentar procedimiento de actualización y restore.

## Ejemplo mínimo de `Jenkinsfile` (declarativo)
```groovy
pipeline {
  agent any
  environment {
    REGISTRY = 'myregistry.example.com/sst-report'
    IMAGE_TAG = "${env.BRANCH_NAME}-${env.GIT_COMMIT.take(8)}"
  }
  stages {
    stage('Checkout') {
      steps { checkout scm }
    }
    stage('Build') {
      steps {
        sh 'npm ci'
        sh 'npm run build --prefix frontend'
      }
    }
    stage('Test') {
      steps {
        sh 'pytest -q' // si aplica
      }
    }
    stage('Docker Build & Push') {
      when { expression { return env.BUILD_IMAGE == 'true' } }
      steps {
        sh "docker build -t ${REGISTRY}:${IMAGE_TAG} ."
        withCredentials([usernamePassword(credentialsId: 'docker-reg-cred', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin myregistry.example.com'
          sh "docker push ${REGISTRY}:${IMAGE_TAG}"
        }
      }
    }
  }
  post {
    success { emailext subject: "Build success: ${env.JOB_NAME}", body: "Build ${env.BUILD_NUMBER} succeeded." }
    failure { emailext subject: "Build failed: ${env.JOB_NAME}", body: "Build ${env.BUILD_NUMBER} failed." }
  }
}
```

## Anexos / Observaciones
- Evaluar uso de `blue-green` o `canary` deployments en la fase de CD.
- Considerar ejecución de agentes dentro de Kubernetes si la infraestructura ya usa K8s.
- Definir política de aprobación y seguridad para el acceso a credenciales de producción.

---

Si quieres, lo convierto en una presentación corta (PowerPoint) o en un `README` más formal con secciones expandibles. También puedo adaptar el archivo para una política de seguridad CFG (ej.: requisitos exactos de memoria/CPU según el número de builds concurrentes esperado).