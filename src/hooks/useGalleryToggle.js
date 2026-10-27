import { Alert, Linking } from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { useI18n } from '../i18n/I18nContext';
import { requestGalleryPermission } from '../utils/photos';

// Interruptor "guardar fotos na galeria" (Perfil e introdução): ao ligar, pede logo a permissão;
// se for recusada, a opção fica desligada e explica como a dar nas Definições.
export function useGalleryToggle() {
  const { t } = useI18n();
  const { setSetting } = useSettings();

  return async (next) => {
    if (!next) return setSetting('saveToGallery', false);
    try {
      const perm = await requestGalleryPermission();
      if (perm.granted) return setSetting('saveToGallery', true);
      Alert.alert(
        t('profile.galleryDeniedTitle'),
        t('profile.galleryDeniedMsg'),
        perm.canAskAgain
          ? undefined
          : [
              { text: t('common.cancel'), style: 'cancel' },
              { text: t('cam.openSettings'), onPress: () => Linking.openSettings() },
            ]
      );
    } catch (e) {
      console.warn('Permissão da galeria indisponível', e);
      Alert.alert(t('profile.galleryErrorTitle'), t('profile.galleryErrorMsg'));
    }
  };
}
