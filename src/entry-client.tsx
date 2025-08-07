import { hydrateRoot } from 'react-dom/client'
import { RouterClient } from '@tanstack/react-router/ssr/client'
import { createRouter } from './router'
import i18n from './i18n';

const router = createRouter()
const lang = i18n.language || 'rw';

// Update the router context with the language
router.update({
  context: {
    ...router.options.context,
    lang: lang,
  },
})

hydrateRoot(document, <RouterClient router={router} />)
