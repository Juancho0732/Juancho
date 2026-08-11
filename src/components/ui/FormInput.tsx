import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { StyleSheet, View, type TextInputProps } from 'react-native';

import { theme } from '@/design-system/theme';

import { Input } from './Input';
import { Text } from './Text';

type Props<TFieldValues extends FieldValues> = Omit<
  TextInputProps,
  'value' | 'onChangeText' | 'onBlur'
> & {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  errorMessage?: string;
};

export function FormInput<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  errorMessage,
  ...inputProps
}: Props<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <View style={styles.wrapper}>
          <Input
            label={label}
            value={typeof value === 'string' ? value : ''}
            onChangeText={onChange}
            onBlur={onBlur}
            {...inputProps}
          />
          {errorMessage ? (
            <Text variant="caption" color="danger">
              {errorMessage}
            </Text>
          ) : null}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: theme.spacing.xs,
  },
});
