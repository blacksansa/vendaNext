import React from 'react';
import { Input } from './input';
import { Textarea } from './textarea';
import { Select } from './select';

export const TextInput = React.forwardRef((props, ref) => (
  <Input ref={ref} {...props} />
));

export const TextAreaInput = React.forwardRef((props, ref) => (
  <Textarea ref={ref} {...props} />
));

export const SelectInput = React.forwardRef((props, ref) => (
  <Select ref={ref} {...props} />
));

export default {
  TextInput,
  TextAreaInput,
  SelectInput,
};