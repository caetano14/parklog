import { StyleSheet, View } from 'react-native';
import { Text, TextInput } from './AppText';
import { useI18n } from '../i18n/I18nContext';
import { C, RADIUS } from '../constants';

// Campo de texto com etiqueta, "(opcional)" e mensagem de erro
export default function Field({ label, optional, error, inputRef, ...props }) {
  const { t } = useI18n();
  return (
    <View style={s.group}>
      <Text style={s.label}>
        {label}
        {optional ? <Text style={s.optional}> ({t('common.optional')})</Text> : null}
      </Text>
      <TextInput
        ref={inputRef}
        style={[s.input, error && s.inputError]}
        placeholderTextColor={C.muted}
        selectionColor={C.text}
        {...props}
      />
      {error ? <Text style={s.error}>{error}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  group: { gap: 8 },
  label: { color: C.text, fontSize: 14, fontWeight: '700' },
  optional: { color: C.muted, fontWeight: '500' },
  input: {
    backgroundColor: C.field, borderWidth: 1, borderColor: C.borderStrong, borderRadius: RADIUS.field,
    color: C.text, fontSize: 16, paddingHorizontal: 14, paddingVertical: 13,
  },
  inputError: { borderColor: C.danger },
  error: { color: C.danger, fontSize: 13 },
});
