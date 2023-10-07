import { useRef, useState } from "react";

import { Controller } from "react-hook-form";

import "./form.css";

const errorClass = "form-control-danger";

export function SubmitButton({ text, className = null }) {
  return (
    <button type="submit" className={className || "btn btn-primary"}>
      {text}
    </button>
  );
}

export function TextInput({
  id,
  title,
  form,
  type = "text",
  placeHolder = "",
  autoComplete = "off",
  options = {},
}) {
  const ref = useRef();
  const errors = form.formState.errors;

  if (errors[id]) {
    ref.current?.classList.add(errorClass);
  } else {
    ref.current?.classList.remove(errorClass);
  }

  return (
    <div className="form-floating mb-3" ref={ref}>
      <input
        className="form-control"
        type={type}
        autoComplete={autoComplete}
        id={id}
        placeholder={placeHolder}
        {...form.register(id, options)}
      />
      <label htmlFor={id} className="form-label">
        {title}
        {errors[id] && <> — {errors[id]?.message}</>}
      </label>
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
    ref.current?.classList.add(errorClass);
  } else {
    ref.current?.classList.remove(errorClass);
  }

  const [characterCount, setCharacterCount] = useState(0);

  const handleTextChange = (e, field) => {
    let text = e.target.value;

    if (options?.maxLength && text.length > options.maxLength) {
      text = text.slice(0, options?.maxLength);
    }

    setCharacterCount(text.length);

    field.onChange(text);
  };

  return (
    <div className="form-floating mb-3" ref={ref}>
      <Controller
        name={id}
        control={form.control}
        defaultValue=""
        rules={{
          ...options,
        }}
        render={({ field }) => (
          <>
            <textarea
              id={id}
              className="form-control"
              autoComplete="off"
              placeholder={placeHolder}
              style={{ height: `${rows * 36}px` }}
              {...field}
              onChange={(e) => handleTextChange(e, field)}
            />
            <label htmlFor={id} className="form-label">
              {title}
              {errors[id] && <> — {errors[id]?.message}</>}
            </label>
            {options?.maxLength && (
              <span className="position-absolute bottom-0 end-0 translate-middle badge rounded-pill bg-secondary bg-opacity-25 text-secondary opacity-75">
                {characterCount} / {options?.maxLength}
                <span className="visually-hidden">characters usage</span>
              </span>
            )}
          </>
        )}
      />
    </div>
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
  const leadingZeros = /^0+/;
  const onlyNumeric = /[^0-9]+/g;
  const errors = form.formState.errors;

  if (errors[id]) {
    ref.current?.classList.add(errorClass);
  } else {
    ref.current?.classList.remove(errorClass);
  }

  return (
    <div className="form-floating mb-3" ref={ref}>
      <Controller
        name={id}
        control={form.control}
        defaultValue={defaultValue}
        rules={{
          ...options,
          pattern: {
            value: /[0-9]+/,
            message: "Only decimal numbers are allowed.",
          },
        }}
        render={({ field }) => {
          return (
            <>
              <input
                id={id}
                {...field}
                {...options}
                placeholder={placeHolder}
                onChange={(e) => {
                  let numericValue = e.target.value.replace(onlyNumeric, "");

                  if (numericValue.length > 1) {
                    numericValue = numericValue.replace(leadingZeros, "");
                  }

                  field.onChange(numericValue);
                }}
                className="form-control"
              />
              <label htmlFor={id} className="form-label">
                {title}
                {errors[id] && <> — {errors[id]?.message}</>}
              </label>
            </>
          );
        }}
      />
    </div>
  );
}

export function DateInput({ id, title, form, options = {} }) {
  const ref = useRef();
  const errors = form.formState.errors;

  if (errors[id]) {
    ref.current?.classList.add(errorClass);
  } else {
    ref.current?.classList.remove(errorClass);
  }

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="form-floating mb-3" ref={ref}>
      <Controller
        name={id}
        control={form.control}
        defaultValue={getCurrentDate()} // Set the default value to the current date
        rules={{
          ...options,
        }}
        render={({ field }) => (
          <>
            <input
              id={id}
              type="date"
              className="form-control"
              {...field}
              {...options}
              // Add any other input attributes you need
            />
            <label htmlFor={id} className="form-label">
              {title}
              {errors[id] && <> — {errors[id]?.message}</>}
            </label>
          </>
        )}
      />
    </div>
  );
}

export function SelectInput({ id, title, form, options = {}, children }) {
  const ref = useRef();
  const errors = form.formState.errors;

  if (errors[id]) {
    ref.current?.classList.add(errorClass);
  } else {
    ref.current?.classList.remove(errorClass);
  }

  return (
    <div className="form-floating mb-3" ref={ref}>
      <Controller
        name={id}
        control={form.control}
        rules={{
          ...options,
        }}
        render={({ field }) => (
          <>
            <select id={id} className="form-select" {...field}>
              {children}
            </select>
            <label htmlFor={id} className="form-label">
              {title}
              {errors[id] && <> — {errors[id]?.message}</>}
            </label>
          </>
        )}
      />
    </div>
  );
}
