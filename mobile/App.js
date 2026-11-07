// Sahayi mobile: a simple home screen + a built-in browser that loads the same
// Sahayi core as the Chrome extension, so government sites open in Simple Mode.
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  KeyboardAvoidingView,
  PermissionsAndroid,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { fetch as expoFetch } from 'expo/fetch';
import { File, Paths } from 'expo-file-system';
import { createApi, DEFAULT_CONFIG } from './src/generated/openai';
import { CORE_JS } from './src/generated/coreBundle';
import { SERVICES } from './src/services';

const KEY_NAME = 'openai_api_key';

// ---------------------------------------------------------------- OpenAI (runs in the app, not in the web page)
const api = createApi({
  fetchImpl: expoFetch,
  async getConfig() {
    const apiKey = (await SecureStore.getItemAsync(KEY_NAME)) || '';
    return { ...DEFAULT_CONFIG, apiKey };
  },
  async appendAudio(form, base64, mime) {
    const ext = mime.includes('webm') ? 'webm' : mime.includes('mp4') ? 'mp4' : 'wav';
    const file = new File(Paths.cache, `answer-${Date.now()}.${ext}`);
    file.create();
    await file.write(base64, { encoding: 'base64' });
    form.append('file', file);
  },
  async responseToBase64(res) {
    const file = new File(Paths.cache, `speech-${Date.now()}.mp3`);
    file.create();
    await file.write(await res.bytes());
    const b64 = await file.base64();
    try {
      file.delete();
    } catch {}
    return b64;
  },
});

// Injected into every page the built-in browser loads.
const INJECT =
  CORE_JS +
  `
;(function(){try{if(!window.__sahayiBooted){window.__sahayiBooted=true;window.Sahayi.boot({platform:'mobile',autoOpen:true});}}
catch(e){window.ReactNativeWebView.postMessage(JSON.stringify({sahayi:true,event:'error',data:String(e)}));}})();
true;`;

function withScheme(u) {
  const t = u.trim();
  if (!t) return '';
  return /^https?:\/\//i.test(t) ? t : 'https://' + t;
}

// ---------------------------------------------------------------- UI pieces
function BigButton({ label, sub, onPress, primary, style, accessibilityLabel }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      style={({ pressed }) => [styles.btn, primary && styles.btnPrimary, pressed && styles.pressed, style]}
    >
      <Text style={[styles.btnText, primary && styles.btnTextPrimary]}>{label}</Text>
      {sub ? <Text style={[styles.btnSub, primary && styles.btnTextPrimary]}>{sub}</Text> : null}
    </Pressable>
  );
}

function Home({ onOpen, onSettings, hasKey }) {
  const [url, setUrl] = useState('');
  return (
    <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
      <Text style={styles.brand} accessibilityRole="header">
        സഹായി
      </Text>
      <Text style={styles.lead}>സർക്കാർ സേവനങ്ങൾ ലളിതമായി, മലയാളത്തിൽ, ശബ്ദത്തോടെ.</Text>
      <Text style={styles.leadEn}>Government services made simple, in Malayalam, with voice.</Text>

      {!hasKey ? (
        <View style={styles.warn}>
          <Text style={styles.warnText}>⚠ OpenAI API കീ ചേർക്കണം / Add your OpenAI API key</Text>
          <BigButton label="⚙  ക്രമീകരണങ്ങൾ · Settings" onPress={onSettings} />
        </View>
      ) : null}

      <Text style={styles.h2} accessibilityRole="header">
        സേവനങ്ങൾ · Services
      </Text>
      {SERVICES.map((s) => (
        <BigButton key={s.url} label={`${s.icon}  ${s.ml}`} sub={s.en} onPress={() => onOpen(s.url)} style={styles.tile} />
      ))}

      <Text style={styles.h2} accessibilityRole="header">
        മറ്റൊരു വെബ്സൈറ്റ് · Other website
      </Text>
      <TextInput
        style={styles.input}
        value={url}
        onChangeText={setUrl}
        placeholder="https://"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        returnKeyType="go"
        onSubmitEditing={() => url && onOpen(withScheme(url))}
        accessibilityLabel="Website address"
      />
      <BigButton label="തുറക്കുക · Open  ▶" primary onPress={() => url && onOpen(withScheme(url))} />

      <BigButton label="⚙  ക്രമീകരണങ്ങൾ · Settings" onPress={onSettings} style={{ marginTop: 32 }} />
    </ScrollView>
  );
}

function Settings({ onDone }) {
  const [key, setKey] = useState('');
  const [msg, setMsg] = useState('');
  useEffect(() => {
    SecureStore.getItemAsync(KEY_NAME).then((k) => setKey(k || ''));
  }, []);
  const save = async () => {
    await SecureStore.setItemAsync(KEY_NAME, key.trim());
    setMsg(key.trim() ? '✓ സേവ് ചെയ്തു · Saved' : 'Saved (empty)');
  };
  const clearCache = async () => {
    const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith('sahayi:c:tpl:'));
    await AsyncStorage.multiRemove(keys);
    setMsg(`✓ ${keys.length} saved page(s) cleared`);
  };
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <Text style={styles.h1} accessibilityRole="header">
          ക്രമീകരണങ്ങൾ · Settings
        </Text>
        <Text style={styles.label}>OpenAI API key</Text>
        <TextInput
          style={styles.input}
          value={key}
          onChangeText={setKey}
          placeholder="sk-..."
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="OpenAI API key"
        />
        <Text style={styles.hint}>Stored securely on this phone only.</Text>
        <BigButton label="സേവ് ചെയ്യുക · Save" primary onPress={save} />
        {msg ? <Text style={styles.ok}>{msg}</Text> : null}
        <BigButton label="Clear saved pages" onPress={clearCache} style={{ marginTop: 24 }} />
        <BigButton label="◀  തിരികെ · Back" onPress={onDone} style={{ marginTop: 24 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Browser({ url, onHome, onSettings }) {
  const web = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [simpleOpen, setSimpleOpen] = useState(true);

  useEffect(() => {
    if (Platform.OS === 'android') PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO).catch(() => {});
  }, []);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack) web.current?.goBack();
      else onHome();
      return true;
    });
    return () => sub.remove();
  }, [canGoBack, onHome]);

  const reply = (id, res) => {
    web.current?.injectJavaScript(`window.__sahayiResolve && window.__sahayiResolve(${JSON.stringify(id)}, ${JSON.stringify(res)}); true;`);
  };

  const onMessage = useCallback(
    async (e) => {
      let msg;
      try {
        msg = JSON.parse(e.nativeEvent.data);
      } catch {
        return;
      }
      if (!msg || !msg.sahayi) return;
      if (msg.event) {
        if (msg.event === 'closed') setSimpleOpen(false);
        if (msg.event === 'opened') setSimpleOpen(true);
        if (msg.event === 'error') console.warn('Sahayi page error:', msg.data);
        return;
      }
      try {
        const p = msg.payload || {};
        let data;
        switch (msg.type) {
          case 'analyze':
          case 'normalize':
          case 'tts':
          case 'transcribe':
            data = await api[msg.type](p);
            break;
          case 'get': {
            const v = await AsyncStorage.getItem('sahayi:c:' + p.key);
            data = v ? JSON.parse(v) : null;
            break;
          }
          case 'set':
            await AsyncStorage.setItem('sahayi:c:' + p.key, JSON.stringify(p.value));
            data = true;
            break;
          case 'settings':
            onSettings();
            data = true;
            break;
          default:
            throw new Error('Unknown request ' + msg.type);
        }
        reply(msg.id, { ok: true, data });
      } catch (err) {
        reply(msg.id, { ok: false, error: err.code || String(err.message || err) });
      }
    },
    [onSettings]
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.bar}>
        <BigButton label="⌂  തുടക്കം" onPress={onHome} style={styles.barBtn} accessibilityLabel="Home" />
        {!simpleOpen ? (
          <BigButton
            label="സഹായി  ▶"
            primary
            style={styles.barBtn}
            onPress={() => web.current?.injectJavaScript('window.Sahayi && window.Sahayi.open(); true;')}
            accessibilityLabel="Open Sahayi simple view"
          />
        ) : null}
      </View>
      <WebView
        ref={web}
        source={{ uri: url }}
        injectedJavaScript={INJECT}
        onMessage={onMessage}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
        setSupportMultipleWindows={false}
        mediaCapturePermissionGrantType="grant"
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback
        startInLoadingState
        onNavigationStateChange={(s) => setCanGoBack(s.canGoBack)}
        style={{ flex: 1 }}
      />
    </View>
  );
}

// ---------------------------------------------------------------- app
export default function App() {
  const [screen, setScreen] = useState('home');
  const [url, setUrl] = useState('');
  const [hasKey, setHasKey] = useState(true);
  const [returnTo, setReturnTo] = useState('home');

  useEffect(() => {
    if (screen === 'home') SecureStore.getItemAsync(KEY_NAME).then((k) => setHasKey(!!k));
  }, [screen]);

  const openSettings = useCallback(() => {
    setReturnTo(screen);
    setScreen('settings');
  }, [screen]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FBF8F1" />
      {screen === 'home' ? (
        <Home
          hasKey={hasKey}
          onSettings={openSettings}
          onOpen={(u) => {
            setUrl(u);
            setScreen('browser');
          }}
        />
      ) : null}
      {screen === 'settings' ? <Settings onDone={() => setScreen(returnTo === 'browser' && url ? 'browser' : 'home')} /> : null}
      {screen === 'browser' ? <Browser url={url} onHome={() => setScreen('home')} onSettings={openSettings} /> : null}
    </View>
  );
}

const C = { bg: '#FBF8F1', surface: '#FFFFFF', text: '#16181D', muted: '#3D4350', accent: '#0A4D99', border: '#B9C0CB', warnBg: '#FFF3D1', warn: '#5C3B00', ok: '#0B6B2E' };

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 48 },
  page: { padding: 16, paddingBottom: 48 },
  brand: { fontSize: 40, fontWeight: '800', color: C.accent, marginTop: 12 },
  lead: { fontSize: 22, lineHeight: 34, color: C.text, marginTop: 8 },
  leadEn: { fontSize: 18, lineHeight: 28, color: C.muted, marginTop: 4 },
  h1: { fontSize: 30, fontWeight: '800', color: C.text, marginVertical: 12 },
  h2: { fontSize: 22, fontWeight: '800', color: C.text, marginTop: 28, marginBottom: 12 },
  label: { fontSize: 20, fontWeight: '700', color: C.text, marginTop: 12, marginBottom: 8 },
  hint: { fontSize: 16, color: C.muted, marginVertical: 8 },
  ok: { fontSize: 20, fontWeight: '700', color: C.ok, marginTop: 12 },
  warn: { backgroundColor: C.warnBg, borderColor: C.warn, borderWidth: 3, borderRadius: 14, padding: 14, marginTop: 20 },
  warnText: { color: C.warn, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  input: { minHeight: 64, borderWidth: 3, borderColor: C.text, borderRadius: 12, paddingHorizontal: 16, fontSize: 22, backgroundColor: C.surface, color: C.text, marginBottom: 12 },
  btn: { minHeight: 64, borderRadius: 14, borderWidth: 3, borderColor: C.accent, backgroundColor: C.surface, paddingVertical: 12, paddingHorizontal: 18, justifyContent: 'center', alignItems: 'center' },
  btnPrimary: { backgroundColor: C.accent },
  btnText: { fontSize: 20, fontWeight: '800', color: C.accent, textAlign: 'center' },
  btnTextPrimary: { color: '#FFFFFF' },
  btnSub: { fontSize: 16, fontWeight: '600', color: C.muted, marginTop: 2, textAlign: 'center' },
  pressed: { opacity: 0.7 },
  tile: { marginBottom: 12, alignItems: 'flex-start' },
  bar: { flexDirection: 'row', gap: 10, padding: 8, backgroundColor: C.surface, borderBottomWidth: 2, borderBottomColor: C.border },
  barBtn: { flex: 1, minHeight: 52, paddingVertical: 6 },
});
