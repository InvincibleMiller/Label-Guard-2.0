import { useRef } from "react";

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
