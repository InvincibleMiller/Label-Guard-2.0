import { useRef } from "react";

import { Controller } from "react-hook-form";

export function TextInput({
  id,
  title,
  form,
  type = "text",
  placeHolder = "",
  options = {},
}) {
  const ref = useRef();
  const errors = form.formState.errors;

  if (errors[id]) {
    ref.current?.classList.add("error");
  } else {
    ref.current?.classList.remove("error");
  }

  return (
    <div className="mb-3" ref={ref}>
      <label htmlFor={id} className="form-label">
        {title}
        {errors[id] && <> — {errors[id]?.message}</>}
      </label>
      <input
        className="form-control"
        type={type}
        autoComplete="off"
        id={id}
        placeholder={placeHolder}
        {...form.register(id, options)}
      />
    </div>
  );
}

export function TextAreaInput({
  id,
  title,
  form,
  placeHolder = "",
  options = {},
  rows = 2,
}) {
  const ref = useRef();
  const errors = form.formState.errors;

  if (errors[id]) {
    ref.current?.classList.add("error");
  } else {
    ref.current?.classList.remove("error");
  }

  return (
    <div className="mb-3" ref={ref}>
      <label htmlFor={id} className="form-label">
        {title}
        {errors[id] && <> — {errors[id]?.message}</>}
      </label>
      <textarea
        className="form-control"
        autoComplete="off"
        rows={rows}
        id={id}
        placeholder={placeHolder}
        {...form.register(id, options)}
      />
    </div>
  );
}

export function SubmitButton({ text, className = null }) {
  return (
    <button type="submit" className={className || "btn btn-primary"}>
      {text}
    </button>
  );
}

export function NumberInput({
  id,
  title,
  form,
  placeHolder = "",
  defaultValue = "2",
  options = {},
}) {
  const ref = useRef();
  const pattern = /^[1-9][0-9]*$/;
  const leadingZeros = /^0+/;
  const onlyNumeric = /[^0-9]+/g;
  const errors = form.formState.errors;

  if (errors[id]) {
    ref.current?.classList.add("error");
  } else {
    ref.current?.classList.remove("error");
  }

  return (
    <div className="mb-3" ref={ref}>
      <Controller
        name={id}
        control={form.control}
        defaultValue={defaultValue}
        rules={{
          ...options,
          pattern: {
            value: pattern,
            message: "Only decimal numbers are allowed.",
          },
        }}
        render={({ field }) => {
          return (
            <>
              <label htmlFor={id} className="form-label">
                {title}
                {errors[id] && <> — {errors[id]?.message}</>}
              </label>
              <input
                id={id}
                {...field}
                {...options}
                placeholder={placeHolder}
                onChange={(e) => {
                  const numericValue = e.target.value.replace(leadingZeros, "");
                  const finalValue = numericValue.replace(onlyNumeric, "");
                  field.onChange(finalValue);
                }}
                className="form-control"
              />
            </>
          );
        }}
      />
    </div>
  );
}
