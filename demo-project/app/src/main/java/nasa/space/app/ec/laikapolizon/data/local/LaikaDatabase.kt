package nasa.space.app.ec.laikapolizon.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.migration.Migration
import androidx.sqlite.db.SupportSQLiteDatabase

@Database(
    entities = [MeasurementEntity::class, CareEventEntity::class, KnowledgeNoteEntity::class],
    version = 3,
    exportSchema = false,
)
abstract class LaikaDatabase : RoomDatabase() {
    abstract fun measurementDao(): MeasurementDao
    abstract fun careEventDao(): CareEventDao
    abstract fun knowledgeNoteDao(): KnowledgeNoteDao

    companion object {
        /** v1 → v2 (Fase 3): tabla de acciones de cuidado. Conserva las mediciones existentes. */
        val MIGRATION_1_2 = object : Migration(1, 2) {
            override fun migrate(db: SupportSQLiteDatabase) {
                db.execSQL(
                    "CREATE TABLE IF NOT EXISTS `care_events` (" +
                        "`id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, " +
                        "`timestampMillis` INTEGER NOT NULL, " +
                        "`kind` TEXT NOT NULL, " +
                        "`actionIds` TEXT NOT NULL, " +
                        "`points` INTEGER NOT NULL)"
                )
            }
        }

        /** v2 → v3: conocimiento de Laika (contexto social). Conserva mediciones y cuidados. */
        val MIGRATION_2_3 = object : Migration(2, 3) {
            override fun migrate(db: SupportSQLiteDatabase) {
                db.execSQL(
                    "CREATE TABLE IF NOT EXISTS `knowledge_notes` (" +
                        "`id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, " +
                        "`timestampMillis` INTEGER NOT NULL, " +
                        "`kind` TEXT NOT NULL, " +
                        "`appLabel` TEXT, " +
                        "`category` TEXT, " +
                        "`text` TEXT, " +
                        "`durationSec` INTEGER, " +
                        "`topics` TEXT NOT NULL, " +
                        "`mood` TEXT)"
                )
            }
        }

        fun create(context: Context): LaikaDatabase =
            Room.databaseBuilder(context, LaikaDatabase::class.java, "laika.db")
                .addMigrations(MIGRATION_1_2, MIGRATION_2_3)
                .build()
    }
}
