import { useRef, useState } from "react";

import { Controller } from "react-hook-form";

import "./form.css";
import moment from "moment";

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
  defaultValue = "",
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
      <Controller
        name={id}
        control={form.control}
        defaultValue={defaultValue}
        rules={{ ...options }}
        render={({ field }) => {
          return (
            <>
              <input
                {...field}
                id={id}
                type={type}
                className="form-control"
                placeholder={placeHolder}
                autoComplete={autoComplete}
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

export function TextAreaInput({
  id,
  title,
  form,
  placeHolder = "",
  defaultValue = "",
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

  const [characterCount, setCharacterCount] = useState(defaultValue.length);

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
        defaultValue={defaultValue}
        rules={{
          ...options,
        }}
        render={({ field }) => (
          <>
            <textarea
              id={id}
              className="form-control"
              autoComplete="off"
              style={{ height: `${rows * 36}px` }}
              {...field}
              onChange={(e) => handleTextChange(e, field)}
            >
              {defaultValue}
            </textarea>
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

export function DateInput({
  id,
  title,
  form,
  options = {},
  defaultValue = undefined,
  utc = false,
}) {
  const ref = useRef();
  const errors = form.formState.errors;

  if (errors[id]) {
    ref.current?.classList.add(errorClass);
  } else {
    ref.current?.classList.remove(errorClass);
  }

  const date = utc ? moment.utc(defaultValue) : moment(defaultValue);

  const getDateString = () => {
    return date.format("YYYY-MM-DD");
  };

  return (
    <div className="form-floating mb-3" ref={ref}>
      <Controller
        name={id}
        control={form.control}
        defaultValue={getDateString()} // Set the default value to the current date
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

export function SelectInput({
  id,
  title,
  form,
  options = {},
  defaultValue = 0,
  children,
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
      <Controller
        name={id}
        control={form.control}
        rules={{
          ...options,
        }}
        defaultValue={defaultValue}
        render={({ field }) => (
          <>
            <select
              id={id}
              // defaultValue={defaultValue}
              className="form-select form-control"
              {...field}
            >
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
