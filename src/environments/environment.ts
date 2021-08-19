import { IEnvironment } from '../app/components/eva-adyen-test/bootstrap-store';

export const environment: IEnvironment = {
  version: require('../../package.json').version,
  production: false,
  // websiteUrl: 'https://rituals-giftcard-dev.firebaseapp.com',
  contentfulSpaceId: 'iidvoh19tp5i',
  contentfulToken:
    '768ddd39a527a5e9d49ff1e2bd176bcb7e73bf2b913a7fd4b5f9ec23df757e1b',
  contentfulFallbackImageContentTypeID: 'digitalGiftcardsFallbackImage',
  cloudinarySpaceId: 'dugx7wppl',
  cloudinaryUploadPreset: 'ml_default'
};
