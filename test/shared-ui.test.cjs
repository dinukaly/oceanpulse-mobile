const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { create, act } = require('react-test-renderer');

// Native hosts are doubles: these checks cover component contracts, not device layout.
function harness(overrides = {}) {
  const cache = new Map();
  const fontState = { loaded: false };
  const rn = Object.fromEntries(['View', 'Text', 'Pressable', 'ActivityIndicator', 'Modal', 'ScrollView', 'KeyboardAvoidingView'].map(n => [n, n]));
  rn.TextInput = React.forwardRef((props, ref) => React.createElement('TextInput', { ...props, ref }));
  rn.Platform = { OS: 'ios' };
  function load(file) {
    if (cache.has(file)) return cache.get(file);
    const exports = {};
    cache.set(file, exports);
    const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { fileName: file,
      compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 } }).outputText;
    vm.runInNewContext(source, { exports, setInterval, clearInterval, require(name) {
      if (overrides[name]) return overrides[name];
      if (name === 'react' || name === 'react/jsx-runtime') return require(name);
      if (name === 'react-native') return rn;
      if (name === 'react-native-safe-area-context') return { SafeAreaView: 'SafeAreaView' };
      if (name === 'expo-font') return { useFonts: () => [fontState.loaded, null] };
      if (name.endsWith('.ttf')) return 1;
      let base = name.startsWith('@/') ? path.join(__dirname, '..', name.slice(2)) : path.resolve(path.dirname(file), name);
      for (const ext of ['.ts', '.tsx']) if (fs.existsSync(base + ext)) return load(base + ext);
      throw new Error(`Unexpected import ${name}`);
    }});
    return exports;
  }
  return { fontState, load: name => load(path.join(__dirname, '..', name)) };
}

test('code entry normalizes pasted codes, supports deletion, and exposes one editable input', () => {
  const { load } = harness();
  const CodeEntry = load('components/ui/CodeEntry.tsx').default;
  let value;
  let tree;
  act(() => { tree = create(React.createElement(CodeEntry, { value: '', onChangeText: next => { value = next; } })); });
  const inputs = tree.root.findAllByType('TextInput');
  assert.equal(inputs.length, 1);
  act(() => inputs[0].props.onChangeText('123 456\n'));
  assert.equal(value, '123456');
  act(() => inputs[0].props.onChangeText('12345'));
  assert.equal(value, '12345');
  act(() => inputs[0].props.onChangeText('12a3456789'));
  assert.equal(value, '123456');
  assert.equal(inputs[0].props.autoComplete, 'one-time-code');
  act(() => tree.unmount());
});

test('sheet prevents system/backdrop dismissal while saving', () => {
  const { load } = harness();
  const Sheet = load('components/ui/BottomSheet.tsx').default;
  let closes = 0;
  let tree;
  const props = { visible: true, title: 'Edit profile', onClose: () => closes++, children: 'Fields' };
  act(() => { tree = create(React.createElement(Sheet, { ...props, busy: true })); });
  tree.root.findByType('Modal').props.onRequestClose();
  tree.root.findAllByType('Pressable')[0].props.onPress();
  assert.equal(closes, 0);
  act(() => tree.update(React.createElement(Sheet, { ...props, busy: false })));
  tree.root.findByType('Modal').props.onRequestClose();
  assert.equal(closes, 1);
  act(() => tree.unmount());
});

test('font fallback renders content before loading and applies the correct Inter weight afterward', () => {
  const { load, fontState } = harness();
  const Provider = load('components/ui/TypographyProvider.tsx').default;
  const AppText = load('components/ui/AppText.tsx').default;
  const render = () => React.createElement(Provider, null, React.createElement(AppText, { variant: 'label' }, 'Save changes'));
  let tree;
  act(() => { tree = create(render()); });
  assert.equal(tree.root.findByType('Text').props.style[1].fontFamily, undefined);
  fontState.loaded = true;
  act(() => tree.update(render()));
  assert.equal(tree.root.findByType('Text').props.style[1].fontFamily, 'Inter-SemiBold');
  act(() => tree.unmount());
});

function authHarness(post) {
  const overrides = {
    '@/utils/api': { default: { post } },
    'react-redux': { useDispatch: () => () => {} },
    '@/store/authSlice': { setUserId: id => ({ type: 'auth/setUserId', payload: id }) },
    '@/utils/session': { saveSession: async () => {} },
    '@/components/ui/CodeEntry': { default: 'CodeEntry' },
    '@/components/ui/ActionButton': { default: 'ActionButton' },
    '@/components/ui/StatusBanner': { default: 'StatusBanner' },
    './AuthLayout': { default: 'AuthLayout' },
    './AuthField': { default: 'AuthField' },
    'react-native': { View: 'View', Text: 'Text', AppState: { addEventListener: () => ({ remove() {} }) } },
  };
  return harness(overrides);
}

test('reset verification rejects partial codes, guards duplicate requests and passes token only to navigation', async () => {
  const requests = [], navigationCalls = [];
  let resolve;
  const { load } = authHarness((...args) => { requests.push(args); return new Promise(done => { resolve = done; }); });
  const Screen = load('components/ui/screen/security/CodeVerificationScreen.tsx').default;
  let tree;
  act(() => { tree = create(React.createElement(Screen, { purpose: 'reset', route: { params: { email: 'nimal@example.com' } }, navigation: { replace: (...args) => navigationCalls.push(args) } })); });
  const verify = () => tree.root.findAllByType('ActionButton')[0].props.onPress();
  await act(async () => { await verify(); });
  assert.equal(requests.length, 0);
  act(() => tree.root.findByType('CodeEntry').props.onChangeText('123456'));
  let pending;
  act(() => { pending = verify(); verify(); });
  assert.equal(requests.length, 1);
  assert.equal(requests[0][0], 'users/verify-reset-otp');
  assert.equal(requests[0][1].otp, '123456');
  await act(async () => { resolve({ data: { success: true, data: { resetToken: 'private-reset-token' } } }); await pending; });
  assert.equal(navigationCalls[0][0], 'SetNewPassword');
  assert.equal(navigationCalls[0][1].resetToken, 'private-reset-token');
  assert.ok(!JSON.stringify(tree.toJSON()).includes('private-reset-token'));
  assert.ok(!JSON.stringify(tree.toJSON()).includes('nimal@example.com'));
  await act(async () => { await verify(); });
  assert.equal(requests.length, 1);
  act(() => tree.unmount());
});

test('new password validates confirmation, blocks duplicate saves and repairs return navigation', async () => {
  let requests = 0, resolve;
  const calls = [];
  const { load } = authHarness(() => { requests++; return new Promise(done => { resolve = done; }); });
  const Screen = load('components/ui/screen/security/SetNewPasswordScreen.tsx').default;
  let tree;
  act(() => { tree = create(React.createElement(Screen, { route: { params: { email: 'n@example.com', resetToken: 'secret' } }, navigation: { navigate: name => calls.push(name), reset: value => calls.push(value.routes[0].name) } })); });
  const save = () => tree.root.findAllByType('ActionButton')[0].props.onPress();
  await act(async () => { await save(); });
  assert.equal(requests, 0);
  act(() => {
    const fields = tree.root.findAllByType('AuthField');
    fields[0].props.onChangeText('Fishing123'); fields[1].props.onChangeText('Fishing123');
  });
  let pending;
  act(() => { pending = save(); save(); });
  assert.equal(requests, 1);
  await act(async () => { resolve({ data: { success: true } }); await pending; });
  assert.equal(calls[0], 'Login');
  act(() => tree.root.findAllByType('ActionButton')[1].props.onPress());
  assert.equal(calls[1], 'Login');
  act(() => tree.unmount());
});
