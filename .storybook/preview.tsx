import { withThemeByClassName } from '@storybook/addon-themes';
import type { Preview } from '@storybook/react-vite';
import { Backdrop, type BackdropProps } from '../src/components/backdrop/Backdrop';
import { startLiquidGlassWhenReady } from '../src/lib/liquid-glass/engine';
import './preview.css';

// Stories import components directly, not the library entry that starts the refraction.
startLiquidGlassWhenReady();

const backdropImage = {
  light: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&q=80',
  dark: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600&q=80',
};

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
    a11y: { test: 'todo' },
  },
  globalTypes: {
    backdrop: {
      description: 'Background behind the components',
      toolbar: {
        title: 'Background',
        icon: 'photo',
        items: [
          { value: 'mesh', title: 'Mesh' },
          { value: 'aurora', title: 'Aurora' },
          { value: 'plain', title: 'Plain' },
          { value: 'image', title: 'Image' },
          { value: 'image-blur', title: 'Image (blurred)' },
          { value: 'none', title: 'None (solid color)' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    // Glass needs a picture behind it to show through; a plain light page keeps the regular veils.
    backdrop: 'image',
  },
  decorators: [
    (Story, { globals, parameters, viewMode }) => {
      const backdrop = globals.backdrop as BackdropProps['variant'] | 'image' | 'image-blur' | 'none';
      return (
        <div className="sb-stage" data-view={viewMode} data-stage={parameters.stage}>
          {parameters.backdrop !== false &&
            backdrop !== 'none' &&
            (backdrop === 'image' || backdrop === 'image-blur' ? (
              <Backdrop position="absolute" image={backdropImage} imageBlur={backdrop === 'image-blur' ? 16 : 0} />
            ) : (
              <Backdrop position="absolute" variant={backdrop} />
            ))}
          <Story />
        </div>
      );
    },
    withThemeByClassName({
      themes: { light: 'light', dark: 'dark' },
      defaultTheme: 'light',
    }),
  ],
};

export default preview;
