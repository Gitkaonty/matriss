import { Field } from "formik";
import { useRef } from "react";

function MontantCapitalField({ setFieldValue, calculateValeurPart, values }) {
    const inputRef = useRef(null);

    return (
        <Field name="montantcapital">
            {({ field }) => (
                <input
                    {...field}
                    ref={inputRef}
                    required
                    type="text"
                    placeholder=""
                    onChange={(e) => {
                        const el = e.target;
                        const rawInput = el.value;

                        const cursorBefore = el.selectionStart ?? rawInput.length;

                        const digitsOnly = rawInput.replace(/[^\d,]/g, "").replace(",", ".");

                        const numericValue = parseFloat(digitsOnly);
                        if (isNaN(numericValue)) {
                            setFieldValue("montantcapital", "");
                            return;
                        }

                        const formattedValue = numericValue.toLocaleString("fr-FR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        });

                        const digitCountBefore = rawInput
                            .slice(0, cursorBefore)
                            .replace(/\D/g, "").length;

                        let newCursorPos = 0;
                        let remainingDigits = digitCountBefore;
                        while (newCursorPos < formattedValue.length && remainingDigits > 0) {
                            if (/\d/.test(formattedValue[newCursorPos])) remainingDigits--;
                            newCursorPos++;
                        }

                        setFieldValue("montantcapital", formattedValue);

                        requestAnimationFrame(() => {
                            const input = inputRef.current;
                            if (input) {
                                const pos = Math.min(newCursorPos, input.value.length);
                                input.setSelectionRange(pos, pos);
                            }
                        });
                        const newValeurPart = calculateValeurPart(e.target.value, values.nbrpart);
                        setFieldValue('valeurpart', newValeurPart);
                    }}
                    style={{
                        height: 22,
                        borderTop: "none",
                        borderLeft: "none",
                        borderRight: "none",
                        outline: "none",
                        fontSize: 14,
                        borderWidth: "0.5px",
                        width: "120px",
                        textAlign: "right",
                    }}
                />
            )}
        </Field>
    );
}

export default MontantCapitalField;
