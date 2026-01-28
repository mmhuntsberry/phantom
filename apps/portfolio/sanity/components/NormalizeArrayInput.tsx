"use client";

import { useEffect } from "react";
import { PatchEvent, set } from "sanity";
import type { ArrayOfPrimitivesInputProps } from "sanity";

type Props = ArrayOfPrimitivesInputProps;

export default function NormalizeArrayInput(props: Props) {
  const { value, onChange, renderDefault } = props;

  useEffect(() => {
    if (value !== null) return;
    onChange(PatchEvent.from(set([])));
  }, [value, onChange]);

  return renderDefault(props);
}

