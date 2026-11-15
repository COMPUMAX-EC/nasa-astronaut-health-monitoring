package nasa.space.app.ec.laikapolizon.domain

import nasa.space.app.ec.laikapolizon.domain.model.MeasurementType
import nasa.space.app.ec.laikapolizon.domain.validation.MeasurementValidator
import nasa.space.app.ec.laikapolizon.domain.validation.ValidationIssue
import nasa.space.app.ec.laikapolizon.domain.validation.ValidationResult
import org.junit.Assert.assertEquals
import org.junit.Test

class MeasurementValidatorTest {

    @Test fun `usual glucose is valid`() =
        assertEquals(ValidationResult.Valid, MeasurementValidator.validate(MeasurementType.GLUCOSE, 95.0))

    @Test fun `unusual glucose needs confirmation`() =
        assertEquals(
            ValidationResult.NeedsConfirmation(ValidationIssue.UNUSUAL),
            MeasurementValidator.validate(MeasurementType.GLUCOSE, 220.0),
        )

    @Test fun `impossible value is rejected`() =
        assertEquals(
            ValidationResult.Invalid(ValidationIssue.IMPOSSIBLE),
            MeasurementValidator.validate(MeasurementType.BODY_TEMPERATURE, 52.0),
        )

    @Test fun `blood pressure requires diastolic`() =
        assertEquals(
            ValidationResult.Invalid(ValidationIssue.MISSING_SECONDARY),
            MeasurementValidator.validate(MeasurementType.BLOOD_PRESSURE, 120.0),
        )

    @Test fun `systolic must exceed diastolic`() =
        assertEquals(
            ValidationResult.Invalid(ValidationIssue.SYSTOLIC_NOT_ABOVE_DIASTOLIC),
            MeasurementValidator.validate(MeasurementType.BLOOD_PRESSURE, 80.0, 120.0),
        )

    @Test fun `normal blood pressure is valid`() =
        assertEquals(ValidationResult.Valid, MeasurementValidator.validate(MeasurementType.BLOOD_PRESSURE, 120.0, 80.0))
}
