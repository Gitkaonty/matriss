import { Input } from "@mui/joy";
import { forwardRef } from "react";
import { NumericFormat } from "react-number-format";

const FormatedInput = forwardRef(function FormatedInput(props, ref) {
    const { onChange, ...other } = props;

    return (
        <NumericFormat
            {...other}
            getInputRef={ref}
            onValueChange={(values) => {
                onChange({
                    target: {
                        name: props.name,
                        value: values.floatValue,
                    },
                });
            }}
            thousandSeparator=" "
            decimalSeparator=","
            allowNegative={true}
            valueIsNumericString
            decimalScale={2} // <-- Limite à 2 décimales
            fixedDecimalScale={true} // <-- Affiche toujours 2 décimales (ex : 5 devient 5,00)
            style={{ textAlign: 'right' }}
        />
    );
});

export default FormatedInput;