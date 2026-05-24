from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
CORS(app)

DB_PATH = os.path.join(os.path.dirname(__file__), 'sst.db')

SEED_DATA = [
    dict(fecha="2026-01-07",sede="ALAMOS",planta="Tintorería",riesgo="Químico",nivel="Alto",descripcion="Fuga de colorante ácido en tanque de tintura T-04; ausencia de bandejas de contención y EPP incompleto (sin guantes de nitrilo).",accion="Se detuvo la operación, se colocó señalización y se informó al supervisor de turno.",reportador="Carlos Mendoza",cargo="Operario tintura",ubicacion="Nave 1 – tanque T-04",estado="Cerrado"),
    dict(fecha="2026-01-12",sede="ALAMOS",planta="Ramas",riesgo="Mecánico",nivel="Medio",descripcion="Guarda de protección de rama tensora #3 desajustada, permitiendo acceso a partes móviles durante operación normal.",accion="Se detuvo la máquina y se reportó a mantenimiento para ajuste.",reportador="Ana Lucía Pérez",cargo="Operaria ramas",ubicacion="Nave 2 – rama #3",estado="Cerrado"),
    dict(fecha="2026-01-18",sede="DORADO",planta="Circulares",riesgo="Locativo",nivel="Medio",descripcion="Derrame de aceite lubricante en piso de circulares, zona de tránsito peatonal sin señalizar ni contener.",accion="Se señalizó área y se limpió con aserrín. Pendiente reparación de manguera.",reportador="Jorge Ramírez",cargo="Mecánico",ubicacion="Nave 3 – pasillo central",estado="Cerrado"),
    dict(fecha="2026-01-22",sede="ALAMOS",planta="Confección",riesgo="Ergonómico",nivel="Bajo",descripcion="Puesto de costura sin regulación de altura; operarias con postura forzada de cuello y hombros durante turnos de 8 horas.",accion="Se realizó pausa activa y se reportó a SST para rediseño del puesto.",reportador="María Fernández",cargo="Costurera",ubicacion="Módulo A – puesto 7",estado="Cerrado"),
    dict(fecha="2026-01-29",sede="DORADO",planta="Almacén",riesgo="Locativo",nivel="Alto",descripcion="Estantería metálica con carga excesiva sin anclaje a pared; riesgo inminente de volcamiento sobre zona de paso.",accion="Se restringió acceso al área y se notificó a mantenimiento para anclaje urgente.",reportador="Luis Torres",cargo="Almacenista",ubicacion="Almacén principal – estante E-12",estado="Cerrado"),
    dict(fecha="2026-02-03",sede="ALAMOS",planta="Tintorería",riesgo="Eléctrico",nivel="Crítico",descripcion="Panel eléctrico del horno de secado con tapa removida y bornes expuestos; riesgo de electrocución inminente para el operario.",accion="Se aisló el panel con cinta de seguridad y se detuvo el equipo. Electricista notificado de urgencia.",reportador="Pedro Salinas",cargo="Operario tintorería",ubicacion="Nave 1 – horno H-02",estado="Cerrado"),
    dict(fecha="2026-02-08",sede="DORADO",planta="Raschel",riesgo="Mecánico",nivel="Alto",descripcion="Cadena de transmisión de Raschel R-01 sin protección lateral; partículas metálicas proyectadas durante operación.",accion="Se instaló protección provisional y se solicitó repuesto original a mantenimiento.",reportador="Sandra López",cargo="Operaria Raschel",ubicacion="Nave 4 – Raschel R-01",estado="Cerrado"),
    dict(fecha="2026-02-14",sede="ALAMOS",planta="Urdidos",riesgo="Ergonómico",nivel="Medio",descripcion="Manipulación manual de conos de hilo de más de 20 kg sin ayuda mecánica; tres trabajadoras reportan dolor lumbar agudo.",accion="Se indicó rotación de funciones y uso de faja lumbar. Se solicitó carro transportador.",reportador="Claudia Vargas",cargo="Operaria urdidos",ubicacion="Nave 5 – urdidora U-03",estado="En gestión"),
    dict(fecha="2026-02-19",sede="DORADO",planta="Tintorería",riesgo="Biológico",nivel="Bajo",descripcion="Acumulación de lodo orgánico en sump de la planta de tratamiento de aguas residuales sin limpieza programada hace 3 semanas.",accion="Se reportó a mantenimiento para limpieza urgente y reprogramación del mantenimiento preventivo.",reportador="Andrés Castillo",cargo="Operario ambiental",ubicacion="Planta tratamiento – sump S-01",estado="En gestión"),
    dict(fecha="2026-02-25",sede="ALAMOS",planta="Circulares",riesgo="Mecánico",nivel="Medio",descripcion="Agujas de circular C-07 con desgaste excesivo visible; riesgo de proyección de fragmentos durante tejido a alta velocidad.",accion="Se programó cambio de agujas para el siguiente turno de mantenimiento preventivo.",reportador="Fabio Moreno",cargo="Técnico circular",ubicacion="Nave 3 – circular C-07",estado="Cerrado"),
    dict(fecha="2026-03-04",sede="ALAMOS",planta="Ramas",riesgo="Eléctrico",nivel="Medio",descripcion="Cable de alimentación de rama R-02 con aislamiento deteriorado y empalme sin protección; riesgo de corto circuito.",accion="Se inhabilitó la máquina hasta revisión por parte del electricista de planta.",reportador="Diana Herrera",cargo="Operaria ramas",ubicacion="Nave 2 – rama R-02",estado="Cerrado"),
    dict(fecha="2026-03-09",sede="DORADO",planta="Confección",riesgo="Mecánico",nivel="Bajo",descripcion="Máquina de coser industrial sin protector de aguja instalado; riesgo de pinchazo en dedos durante operación rutinaria.",accion="Se solicitó instalación del protector de aguja al área de mantenimiento.",reportador="Rosa Jiménez",cargo="Costurera",ubicacion="Módulo B – máquina MC-14",estado="En gestión"),
    dict(fecha="2026-03-13",sede="ALAMOS",planta="Tintorería",riesgo="Químico",nivel="Alto",descripcion="Mezcla accidental de ácido acético con sosa cáustica en área de formulación; generación de vapores irritantes detectada.",accion="Se evacuó el área, se activó ventilación de emergencia y se notificó al coordinador SST.",reportador="Héctor Quintero",cargo="Formulador",ubicacion="Nave 1 – formulación F-02",estado="Cerrado"),
    dict(fecha="2026-03-18",sede="DORADO",planta="Almacén",riesgo="Locativo",nivel="Medio",descripcion="Iluminación deficiente en pasillo de almacén 2; nivel de luxes por debajo del mínimo normativo (menor a 200 lux).",accion="Se instalaron luminarias provisionales. Solicitud de mantenimiento correctivo enviada a infraestructura.",reportador="Gustavo Restrepo",cargo="Auxiliar almacén",ubicacion="Almacén 2 – pasillo norte",estado="En gestión"),
    dict(fecha="2026-03-22",sede="ALAMOS",planta="Tricot",riesgo="Mecánico",nivel="Medio",descripcion="Pasacinta de tricot T-04 trabado; operario intentó destrabar manualmente con la máquina aún en movimiento.",accion="Se reforzó la capacitación en procedimiento LOTO y se colocó aviso preventivo en la máquina.",reportador="Juan Pablo Osorio",cargo="Operario tricot",ubicacion="Nave 6 – tricot T-04",estado="Cerrado"),
    dict(fecha="2026-03-27",sede="DORADO",planta="Raschel",riesgo="Psicosocial",nivel="Bajo",descripcion="Trabajadores de turno nocturno reportan fatiga crónica y dificultades para mantener concentración; ambiente de supervisión excesiva.",accion="Se programó reunión con psicóloga ocupacional y se revisó la distribución de turnos rotativos.",reportador="Mónica Suárez",cargo="Líder de turno",ubicacion="Nave 4 – turno noche",estado="En gestión"),
    dict(fecha="2026-04-02",sede="ALAMOS",planta="Tintorería",riesgo="Químico",nivel="Medio",descripcion="Dispensadores de jabón y solución desinfectante vacíos en baños de producción; riesgo de contaminación bioquímica.",accion="Se recargaron dispensadores y se estableció rutina de revisión y recarga diaria.",reportador="Yolanda Cárdenas",cargo="Auxiliar servicios",ubicacion="Baños producción – nave 1",estado="Cerrado"),
    dict(fecha="2026-04-07",sede="DORADO",planta="Circulares",riesgo="Eléctrico",nivel="Alto",descripcion="Tomacorriente trifásico sin tapa y con signos evidentes de sobrecalentamiento en área de circulares; olor a quemado.",accion="Se aisló el circuito de forma inmediata y se solicitó reemplazo urgente al electricista.",reportador="Bernardo Soto",cargo="Mecánico eléctrico",ubicacion="Nave 3 – tablero TB-05",estado="Cerrado"),
    dict(fecha="2026-04-11",sede="ALAMOS",planta="Urdidos",riesgo="Locativo",nivel="Medio",descripcion="Piso de área de urdidos con fisura longitudinal de 3 metros; riesgo de tropiezos y caídas al mismo nivel.",accion="Se señalizó con cinta de seguridad y se reportó a infraestructura para reparación programada.",reportador="Camilo Arango",cargo="Operario urdidos",ubicacion="Nave 5 – zona de entrada",estado="Abierto"),
    dict(fecha="2026-04-15",sede="DORADO",planta="Tintorería",riesgo="Biológico",nivel="Medio",descripcion="Presencia de hongos visibles en paredes del cuarto de máquinas de la tintorería; trabajadores reportan síntomas respiratorios.",accion="Se notificó a SST, se inició limpieza con fungicida. Pendiente inspección médica laboral.",reportador="Liliana Montoya",cargo="Operaria tintorería",ubicacion="Cuarto máquinas – nave 2",estado="Abierto"),
    dict(fecha="2026-04-19",sede="ALAMOS",planta="Confección",riesgo="Ergonómico",nivel="Medio",descripcion="Operarias de confección realizan movimiento repetitivo de pinzas sin pausas activas; reporte de tendinitis bilateral emergente.",accion="Se implementó pausa obligatoria de 5 min cada 2 horas y se solicitó evaluación por fisioterapeuta.",reportador="Patricia Rueda",cargo="Supervisora confección",ubicacion="Módulo C – línea 2",estado="En gestión"),
    dict(fecha="2026-04-24",sede="DORADO",planta="Ramas",riesgo="Mecánico",nivel="Alto",descripcion="Freno de emergencia de rama R-05 con tiempo de respuesta excesivo (mayor a 3 segundos en prueba); riesgo de atrapamiento.",accion="Se suspendió la máquina de forma inmediata y se escaló a mantenimiento especializado externo.",reportador="Roberto Cano",cargo="Técnico ramas",ubicacion="Nave 2 – rama R-05",estado="Abierto"),
    dict(fecha="2026-04-28",sede="ALAMOS",planta="Almacén",riesgo="Locativo",nivel="Bajo",descripcion="Escalera de acceso a estanterías altas sin puntas antideslizantes; reportes de inestabilidad al subir.",accion="Se reemplazó escalera por una con puntas de goma certificadas. Equipo viejo dado de baja.",reportador="Susana Delgado",cargo="Auxiliar almacén",ubicacion="Almacén – estante alto zona A",estado="Cerrado"),
    dict(fecha="2026-05-02",sede="DORADO",planta="Circulares",riesgo="Psicosocial",nivel="Medio",descripcion="Conflicto laboral entre trabajadores del turno diurno por asignación inequitativa de maquinaria; ambiente hostil percibido.",accion="Se realizó mediación con apoyo de recursos humanos y coordinador SST.",reportador="Natalia Gómez",cargo="Operaria circulares",ubicacion="Nave 3 – área de producción",estado="En gestión"),
    dict(fecha="2026-05-05",sede="ALAMOS",planta="Tintorería",riesgo="Químico",nivel="Crítico",descripcion="Derrame de 50 litros de auxiliar dispersante en piso; trabajador sin botas impermeables sufrió contacto dérmico extenso.",accion="Se atendió al trabajador en enfermería, se delimitó zona y se inició limpieza con absorbente.",reportador="Esteban Nieto",cargo="Operario tintorería",ubicacion="Nave 1 – área dispensación",estado="Abierto"),
    dict(fecha="2026-05-07",sede="DORADO",planta="Urdidos",riesgo="Eléctrico",nivel="Medio",descripcion="Luz de emergencia del pasillo principal de urdidos sin batería funcional; no activa durante simulacros de evacuación.",accion="Se solicitó reemplazo de batería al área de mantenimiento eléctrico preventivo.",reportador="Carmenza Leal",cargo="Operaria urdidos",ubicacion="Nave 5 – pasillo evacuación",estado="Abierto"),
    dict(fecha="2026-05-09",sede="ALAMOS",planta="Raschel",riesgo="Mecánico",nivel="Alto",descripcion="Ventilador de extracción de pelusas de Raschel R-03 bloqueado; acumulación de fibras inflamables cerca del motor eléctrico.",accion="Se detuvo la máquina y se limpió acumulación de fibras. Pendiente revisión preventiva completa.",reportador="Rodrigo Arias",cargo="Mecánico",ubicacion="Nave 4 – Raschel R-03",estado="Abierto"),
    dict(fecha="2026-05-12",sede="DORADO",planta="Confección",riesgo="Locativo",nivel="Bajo",descripcion="Señalización de rutas de evacuación en módulo D deteriorada y con colores desvanecidos, incumpliendo NTC 1461.",accion="Se reportó a SST para reposición inmediata de señales de evacuación estandarizadas.",reportador="Viviana Salazar",cargo="Costurera",ubicacion="Módulo D – pasillos internos",estado="Abierto"),
    dict(fecha="2026-05-14",sede="ALAMOS",planta="Circulares",riesgo="Ergonómico",nivel="Bajo",descripcion="Herramienta de puesta a punto de circulares con mango inadecuado; fuerza de agarre excesiva reportada por varios operarios.",accion="Se reportó a compras para adquisición de herramientas ergonómicas certificadas.",reportador="Felipe Castañeda",cargo="Técnico circular",ubicacion="Nave 3 – banco de ajuste",estado="Abierto"),
    dict(fecha="2026-05-14",sede="DORADO",planta="Tintorería",riesgo="Biológico",nivel="Bajo",descripcion="Falta de separación de residuos biológicos (textiles contaminados) en tintorería; mezclados con residuos ordinarios.",accion="Se reforzó capacitación en gestión de residuos y se redistribuyeron los contenedores de clasificación.",reportador="Carolina Bernal",cargo="Operaria ambiental",ubicacion="Nave 2 – punto ecológico",estado="Abierto"),
]

HH_PERIODO = 85000
MESES_ES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS reportes (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            fecha       TEXT    NOT NULL,
            sede        TEXT    NOT NULL,
            planta      TEXT    NOT NULL,
            riesgo      TEXT    NOT NULL,
            nivel       TEXT    NOT NULL,
            descripcion TEXT    NOT NULL,
            accion      TEXT,
            reportador  TEXT    NOT NULL,
            cargo       TEXT,
            ubicacion   TEXT,
            estado      TEXT    NOT NULL DEFAULT "Abierto",
            created_at  TEXT    DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    count = conn.execute('SELECT COUNT(*) FROM reportes').fetchone()[0]
    if count == 0:
        conn.executemany(
            'INSERT INTO reportes (fecha,sede,planta,riesgo,nivel,descripcion,accion,reportador,cargo,ubicacion,estado) '
            'VALUES (:fecha,:sede,:planta,:riesgo,:nivel,:descripcion,:accion,:reportador,:cargo,:ubicacion,:estado)',
            SEED_DATA
        )
        conn.commit()
    conn.close()


def compute_kpis(rows):
    total        = len(rows)
    abiertos     = sum(1 for r in rows if r['estado'] == 'Abierto')
    accidentes   = sum(1 for r in rows if r['nivel'] in ('Alto', 'Crítico'))
    dias_perdidos = accidentes * 4
    IF_  = round(accidentes    * 200000 / HH_PERIODO, 2) if total > 0 else 0
    IS_  = round(dias_perdidos * 200000 / HH_PERIODO, 2) if total > 0 else 0
    ILI  = round(IF_ * IS_ / 1000, 2)
    return {'total': total, 'abiertos': abiertos, 'IF': IF_, 'IS': IS_, 'ILI': ILI}


def compute_tendencia(rows):
    month_map = {}
    for r in rows:
        mes = r['fecha'][:7]
        if mes not in month_map:
            month_map[mes] = {'abiertos': 0, 'cerrados': 0}
        if r['estado'] == 'Cerrado':
            month_map[mes]['cerrados'] += 1
        else:
            month_map[mes]['abiertos'] += 1
    meses_sorted = sorted(month_map)
    return {
        'meses':    [MESES_ES[int(m[5:7]) - 1] + ' ' + m[:4] for m in meses_sorted],
        'abiertos': [month_map[m]['abiertos'] for m in meses_sorted],
        'cerrados': [month_map[m]['cerrados'] for m in meses_sorted],
    }


@app.route('/api/sst_data', methods=['GET'])
def sst_data():
    sede   = request.args.get('sede')
    planta = request.args.get('planta')
    riesgo = request.args.get('riesgo')
    estado = request.args.get('estado')
    desde  = request.args.get('desde')
    hasta  = request.args.get('hasta')

    query  = 'SELECT * FROM reportes WHERE 1=1'
    params = []
    if sede:   query += ' AND sede = ?';   params.append(sede)
    if planta: query += ' AND planta = ?'; params.append(planta)
    if riesgo: query += ' AND riesgo = ?'; params.append(riesgo)
    if estado: query += ' AND estado = ?'; params.append(estado)
    if desde:  query += ' AND fecha >= ?'; params.append(desde)
    if hasta:  query += ' AND fecha <= ?'; params.append(hasta)
    query += ' ORDER BY fecha DESC, id DESC'

    conn = get_db()
    rows = [dict(r) for r in conn.execute(query, params).fetchall()]
    conn.close()

    return jsonify({
        'reportes':  rows,
        'kpis':      compute_kpis(rows),
        'tendencia': compute_tendencia(rows),
        'total':     len(rows),
    })


@app.route('/api/sst_options', methods=['GET'])
def sst_options():
    return jsonify({
        'sedes':   [{'value': 'ALAMOS', 'label': 'Álamos'}, {'value': 'DORADO', 'label': 'El Dorado'}],
        'plantas': ['Tintorería','Ramas','Circulares','Raschel','Tricot','Urdidos','Confección','Almacén'],
        'riesgos': ['Mecánico','Biológico','Químico','Ergonómico','Locativo','Eléctrico','Psicosocial'],
        'estados': ['Abierto','En gestión','Cerrado'],
        'niveles': ['Bajo','Medio','Alto','Crítico'],
    })


@app.route('/api/sst_add_report', methods=['POST'])
def sst_add_report():
    data = request.get_json(force=True)
    required = ['fecha', 'sede', 'planta', 'riesgo', 'nivel', 'descripcion', 'reportador']
    errors = [f'{f} es obligatorio' for f in required if not data.get(f)]
    if errors:
        return jsonify({'errors': errors}), 400

    conn = get_db()
    cur = conn.execute(
        'INSERT INTO reportes (fecha,sede,planta,riesgo,nivel,descripcion,accion,reportador,cargo,ubicacion,estado) '
        'VALUES (?,?,?,?,?,?,?,?,?,?,"Abierto")',
        (data['fecha'], data['sede'], data['planta'], data['riesgo'], data['nivel'],
         data['descripcion'], data.get('accion', ''), data['reportador'],
         data.get('cargo', ''), data.get('ubicacion', ''))
    )
    conn.commit()
    row = dict(conn.execute('SELECT * FROM reportes WHERE id = ?', (cur.lastrowid,)).fetchone())
    conn.close()
    return jsonify(row), 201


@app.route('/api/sst_update_report/<int:report_id>', methods=['PUT'])
def sst_update_report(report_id):
    data = request.get_json(force=True)
    nuevo_estado = data.get('estado')
    if nuevo_estado not in ('Abierto', 'En gestión', 'Cerrado'):
        return jsonify({'error': 'Estado inválido'}), 400

    conn = get_db()
    conn.execute('UPDATE reportes SET estado = ? WHERE id = ?', (nuevo_estado, report_id))
    conn.commit()
    row = conn.execute('SELECT * FROM reportes WHERE id = ?', (report_id,)).fetchone()
    conn.close()
    if not row:
        return jsonify({'error': 'Reporte no encontrado'}), 404
    return jsonify(dict(row))


if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)
