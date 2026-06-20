from django.db import migrations

SUBJECTS_BY_CAREER = {
    "COMP": [
        ("Programación I", "COMP-001"),
        ("Programación II", "COMP-002"),
        ("Estructuras de Datos", "COMP-003"),
        ("Base de Datos", "COMP-004"),
        ("Redes de Computadoras", "COMP-005"),
        ("Sistemas Operativos", "COMP-006"),
        ("Ingeniería de Software", "COMP-007"),
        ("Matemáticas Discretas", "COMP-008"),
    ],
    "ELEC": [
        ("Circuitos Eléctricos I", "ELEC-001"),
        ("Circuitos Eléctricos II", "ELEC-002"),
        ("Máquinas Eléctricas", "ELEC-003"),
        ("Instalaciones Eléctricas", "ELEC-004"),
        ("Electrónica de Potencia", "ELEC-005"),
        ("Sistemas de Control", "ELEC-006"),
        ("Dibujo Técnico Eléctrico", "ELEC-007"),
    ],
    "AUTO": [
        ("Motores de Combustión", "AUTO-001"),
        ("Sistemas de Transmisión", "AUTO-002"),
        ("Electricidad Automotriz", "AUTO-003"),
        ("Inyección Electrónica", "AUTO-004"),
        ("Suspensión y Dirección", "AUTO-005"),
        ("Diagnóstico Automotriz", "AUTO-006"),
        ("Mecánica de Taller", "AUTO-007"),
    ],
    "TELCO": [
        ("Señales y Sistemas", "TELCO-001"),
        ("Redes de Telecomunicaciones", "TELCO-002"),
        ("Comunicaciones Digitales", "TELCO-003"),
        ("Antenas y Propagación", "TELCO-004"),
        ("Fibra Óptica", "TELCO-005"),
        ("Telefonía IP", "TELCO-006"),
        ("Seguridad en Redes", "TELCO-007"),
    ],
    "MINAS": [
        ("Geología General", "MINAS-001"),
        ("Mineralogía", "MINAS-002"),
        ("Topografía Minera", "MINAS-003"),
        ("Explotación de Minas", "MINAS-004"),
        ("Ventilación de Minas", "MINAS-005"),
        ("Seguridad Minera", "MINAS-006"),
        ("Procesamiento de Minerales", "MINAS-007"),
    ],
}


def seed_subjects(apps, schema_editor):
    Career = apps.get_model("students", "Career")
    Subject = apps.get_model("students", "Subject")
    for code, subjects in SUBJECTS_BY_CAREER.items():
        try:
            career = Career.objects.get(code=code)
        except Career.DoesNotExist:
            continue
        for name, subj_code in subjects:
            Subject.objects.get_or_create(
                code=subj_code,
                defaults={"name": name, "career": career},
            )


def reverse_subjects(apps, schema_editor):
    Subject = apps.get_model("students", "Subject")
    codes = [c for subs in SUBJECTS_BY_CAREER.values() for _, c in subs]
    Subject.objects.filter(code__in=codes).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("students", "0002_seed_careers"),
    ]

    operations = [
        migrations.RunPython(seed_subjects, reverse_subjects),
    ]
