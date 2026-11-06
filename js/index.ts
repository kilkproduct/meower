"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

var src_exports = {};
__export(src_exports, {
  ChannelManager: () => ChannelManager,
  DEFAULT_PRESET_STRINGS: () => DEFAULT_PRESET_STRINGS,
  DiscordChannelType: () => DiscordChannelType,
  FOREGROUND_GRACE_PERIOD_MS: () => FOREGROUND_GRACE_PERIOD_MS,
  LifecycleMonitor: () => LifecycleMonitor,
  MAX_INTERVAL_MS: () => MAX_INTERVAL_MS,
  MAX_INTERVAL_SECONDS: () => MAX_INTERVAL_SECONDS,
  MAX_PRESET_LENGTH: () => MAX_PRESET_LENGTH,
  MIN_INTERVAL_MS: () => MIN_INTERVAL_MS,
  MIN_INTERVAL_SECONDS: () => MIN_INTERVAL_SECONDS,
  MessageActionsDiscovery: () => MessageActionsDiscovery,
  MessageSender: () => MessageSender,
  MeowerScheduler: () => MeowerScheduler,
  PresetManager: () => PresetManager,
  SEND_ERROR_BACKOFF_MS: () => SEND_ERROR_BACKOFF_MS,
  STORAGE_NAMESPACE_KEY: () => STORAGE_NAMESPACE_KEY,
  STORAGE_SCHEMA_VERSION: () => STORAGE_SCHEMA_VERSION,
  StorageManager: () => StorageManager,
  buildDefaultPresets: () => buildDefaultPresets,
  createDefaultState: () => createDefaultState,
  createMeowerPlugin: () => createMeowerPlugin,
  createSettingsComponent: () => createSettingsComponent,
  default: () => src_default,
  formatDurationSeconds: () => formatDurationSeconds,
  formatPhaseLabel: () => formatPhaseLabel,
  formatTimestamp: () => formatTimestamp,
  generateRandomIntervalSeconds: () => generateRandomIntervalSeconds,
  isAnnouncementChannelType: () => isAnnouncementChannelType,
  isSendableChannelType: () => isSendableChannelType,
  sanitizePersistedState: () => sanitizePersistedState,
  sanitizePresetContent: () => sanitizePresetContent,
  sanitizePresetList: () => sanitizePresetList,
  sanitizeSelectedChannels: () => sanitizeSelectedChannels,
  selectRandomPreset: () => selectRandomPreset,
  validateIntervalSeconds: () => validateIntervalSeconds
});
// ES module entry point for Valenced.

var MIN_INTERVAL_SECONDS = 600;
var MAX_INTERVAL_SECONDS = 7200;
var MIN_INTERVAL_MS = MIN_INTERVAL_SECONDS * 1e3;
var MAX_INTERVAL_MS = MAX_INTERVAL_SECONDS * 1e3;
var FOREGROUND_GRACE_PERIOD_MS = 600 * 1e3;
var SEND_ERROR_BACKOFF_MS = 60 * 1e3;
var STORAGE_SCHEMA_VERSION = 1;
var STORAGE_NAMESPACE_KEY = "meower_plugin_state_v1";
var DiscordChannelType = ((DiscordChannelType2) => {
  DiscordChannelType2[DiscordChannelType2["GUILD_TEXT"] = 0] = "GUILD_TEXT";
  DiscordChannelType2[DiscordChannelType2["DM"] = 1] = "DM";
  DiscordChannelType2[DiscordChannelType2["GUILD_VOICE"] = 2] = "GUILD_VOICE";
  DiscordChannelType2[DiscordChannelType2["GROUP_DM"] = 3] = "GROUP_DM";
  DiscordChannelType2[DiscordChannelType2["GUILD_CATEGORY"] = 4] = "GUILD_CATEGORY";
  DiscordChannelType2[DiscordChannelType2["GUILD_ANNOUNCEMENT"] = 5] = "GUILD_ANNOUNCEMENT";
  DiscordChannelType2[DiscordChannelType2["ANNOUNCEMENT_THREAD"] = 10] = "ANNOUNCEMENT_THREAD";
  DiscordChannelType2[DiscordChannelType2["PUBLIC_THREAD"] = 11] = "PUBLIC_THREAD";
  DiscordChannelType2[DiscordChannelType2["PRIVATE_THREAD"] = 12] = "PRIVATE_THREAD";
  DiscordChannelType2[DiscordChannelType2["GUILD_STAGE_VOICE"] = 13] = "GUILD_STAGE_VOICE";
  DiscordChannelType2[DiscordChannelType2["GUILD_DIRECTORY"] = 14] = "GUILD_DIRECTORY";
  DiscordChannelType2[DiscordChannelType2["GUILD_FORUM"] = 15] = "GUILD_FORUM";
  DiscordChannelType2[DiscordChannelType2["GUILD_MEDIA"] = 16] = "GUILD_MEDIA";
  return DiscordChannelType2;
})(DiscordChannelType || {});

var DEFAULT_PRESET_STRINGS = Object.freeze([
  "mrrrp~",
  "meow meow!",
  "nyaaa~",
  "mrow :3",
  "stretches and yawns",
  "purr purr~",
  "blep!",
  "mrrp? :3",
  "someone say snacks?",
  "tiny cat noises",
  "nya nya nya!",
  "the cat has arrived.",
  "prrrt! :3",
  "*curls into a warm loaf*",
  "mew~",
  "pspsps?"
]);
var MAX_PRESET_LENGTH = 500;
function buildDefaultPresets(now = Date.now()) {
  return DEFAULT_PRESET_STRINGS.map((text, index) => ({
    id: `default_preset_${index + 1}`,
    content: text,
    enabled: true,
    isDefault: true,
    createdAt: now,
    updatedAt: now
  }));
}
function sanitizePresetContent(raw) {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_PRESET_LENGTH) return null;
  return trimmed;
}
function sanitizePresetList(rawPresets, now = Date.now()) {
  if (!Array.isArray(rawPresets) || rawPresets.length === 0) {
    return buildDefaultPresets(now);
  }
  const seenIds = new Set();
  const validPresets = [];
  for (const item of rawPresets) {
    if (!item || typeof item !== "object") continue;
    const candidate = item;
    const content = sanitizePresetContent(candidate.content);
    if (!content) continue;
    const rawId = typeof candidate.id === "string" && candidate.id.trim().length > 0 ? candidate.id.trim() : `preset_${now}_${validPresets.length + 1}`;
    if (seenIds.has(rawId)) continue;
    seenIds.add(rawId);
    validPresets.push({
      id: rawId,
      content,
      enabled: typeof candidate.enabled === "boolean" ? candidate.enabled : true,
      isDefault: Boolean(candidate.isDefault),
      createdAt: typeof candidate.createdAt === "number" && Number.isFinite(candidate.createdAt) ? candidate.createdAt : now,
      updatedAt: typeof candidate.updatedAt === "number" && Number.isFinite(candidate.updatedAt) ? candidate.updatedAt : now
    });
  }
  return validPresets.length > 0 ? validPresets : buildDefaultPresets(now);
}
function selectRandomPreset(presets, lastSentPresetId, lastSentMessageContent, random = Math.random) {
  const enabledPresets = presets.filter(
    (preset) => preset.enabled && sanitizePresetContent(preset.content) !== null
  );
  if (enabledPresets.length === 0) return null;
  if (enabledPresets.length === 1) return enabledPresets[0];
  const nonRepeatingCandidates = enabledPresets.filter((preset) => {
    if (lastSentPresetId && preset.id === lastSentPresetId) return false;
    if (lastSentMessageContent && preset.content === lastSentMessageContent) return false;
    return true;
  });
  const pool = nonRepeatingCandidates.length > 0 ? nonRepeatingCandidates : enabledPresets;
  const rawRandom = random();
  const clampedRandom = Number.isFinite(rawRandom) && rawRandom >= 0 && rawRandom < 1 ? rawRandom : Math.random();
  const index = Math.floor(clampedRandom * pool.length);
  return pool[Math.min(Math.max(0, index), pool.length - 1)];
}
var PresetManager = class {
  constructor(options) {
    this.getPresets = options.getPresets;
    this.setPresets = options.setPresets;
    this.now = options.now ?? Date.now;
  }
  listPresets() {
    return this.getPresets().map((preset) => ({ ...preset }));
  }
  getEnabledPresets() {
    return this.getPresets().filter((preset) => preset.enabled && sanitizePresetContent(preset.content) !== null).map((preset) => ({ ...preset }));
  }
  togglePreset(id, enabled) {
    const current = this.getPresets();
    let found = false;
    const updated = current.map((preset) => {
      if (preset.id !== id) return preset;
      found = true;
      return {
        ...preset,
        enabled: typeof enabled === "boolean" ? enabled : !preset.enabled,
        updatedAt: this.now()
      };
    });
    if (found) this.setPresets(updated);
    return found;
  }
  addCustomPreset(rawContent) {
    const content = sanitizePresetContent(rawContent);
    if (!content) {
      throw new Error(`Preset message must be between 1 and ${MAX_PRESET_LENGTH} non-whitespace characters.`);
    }
    const timestamp = this.now();
    const current = this.getPresets();
    const id = `custom_preset_${timestamp}_${Math.random().toString(36).slice(2, 8)}`;
    const created = {
      id,
      content,
      enabled: true,
      isDefault: false,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    this.setPresets([...current, created]);
    return { ...created };
  }
  editPreset(id, rawContent) {
    const content = sanitizePresetContent(rawContent);
    if (!content) {
      throw new Error(`Preset message must be between 1 and ${MAX_PRESET_LENGTH} non-whitespace characters.`);
    }
    const current = this.getPresets();
    let updatedItem = null;
    const timestamp = this.now();
    const next = current.map((preset) => {
      if (preset.id !== id) return preset;
      updatedItem = { ...preset, content, updatedAt: timestamp };
      return updatedItem;
    });
    if (!updatedItem) throw new Error(`Preset with id "${id}" not found.`);
    this.setPresets(next);
    return { ...updatedItem };
  }
  deletePreset(id) {
    const current = this.getPresets();
    const next = current.filter((preset) => preset.id !== id);
    if (next.length === current.length) return false;
    this.setPresets(next);
    return true;
  }
  restoreDefaults() {
    const defaults = buildDefaultPresets(this.now());
    this.setPresets(defaults);
    return defaults.map((preset) => ({ ...preset }));
  }
  selectNextMessage(lastSentPresetId, lastSentMessageContent, random = Math.random) {
    return selectRandomPreset(this.getPresets(), lastSentPresetId, lastSentMessageContent, random);
  }
};

function validateIntervalSeconds(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const rounded = Math.round(value);
  if (rounded < MIN_INTERVAL_SECONDS || rounded > MAX_INTERVAL_SECONDS) return null;
  return rounded;
}
function sanitizeSelectedChannels(raw, now = Date.now()) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const result = {};
  for (const [key, val] of Object.entries(raw)) {
    if (!val || typeof val !== "object") continue;
    const record = val;
    const channelId = typeof record.channelId === "string" && record.channelId.trim().length > 0 ? record.channelId.trim() : key.trim();
    if (!channelId || !/^\d{5,30}$|^[a-zA-Z0-9_-]{3,64}$/.test(channelId)) continue;
    result[channelId] = {
      channelId,
      guildId: typeof record.guildId === "string" && record.guildId.trim().length > 0 ? record.guildId.trim() : null,
      isAnnouncementExplicitlyAllowed: Boolean(record.isAnnouncementExplicitlyAllowed),
      selectedAt: typeof record.selectedAt === "number" && Number.isFinite(record.selectedAt) ? record.selectedAt : now
    };
  }
  return result;
}
function createDefaultState(now = Date.now()) {
  return {
    schemaVersion: STORAGE_SCHEMA_VERSION,
    enabled: true,
    presets: buildDefaultPresets(now),
    selectedChannels: {},
    lastSuccessfulSendAt: null,
    lastSentPresetId: null,
    lastSentMessageContent: null,
    currentIntervalSeconds: null,
    nextDueAt: null,
    pendingMessage: false,
    pendingFromInactivity: false
  };
}
function sanitizePersistedState(raw, now = Date.now()) {
  const defaults = createDefaultState(now);
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return defaults;
  const source = raw;
  const lastSuccessfulSendAt = typeof source.lastSuccessfulSendAt === "number" && Number.isFinite(source.lastSuccessfulSendAt) && source.lastSuccessfulSendAt > 0 && source.lastSuccessfulSendAt <= now + 6e4 ? source.lastSuccessfulSendAt : null;
  const validatedInterval = validateIntervalSeconds(source.currentIntervalSeconds);
  let nextDueAt = null;
  if (typeof source.nextDueAt === "number" && Number.isFinite(source.nextDueAt) && source.nextDueAt > 0) {
    const maxAllowedFutureDue = now + MAX_INTERVAL_SECONDS * 1e3;
    const minAllowedAfterLastSend = lastSuccessfulSendAt !== null ? lastSuccessfulSendAt + MIN_INTERVAL_SECONDS * 1e3 : null;
    if (source.nextDueAt <= maxAllowedFutureDue) {
      if (minAllowedAfterLastSend !== null && source.nextDueAt < minAllowedAfterLastSend) {
        nextDueAt = minAllowedAfterLastSend;
      } else {
        nextDueAt = source.nextDueAt;
      }
    }
  }
  return {
    schemaVersion: STORAGE_SCHEMA_VERSION,
    enabled: typeof source.enabled === "boolean" ? source.enabled : defaults.enabled,
    presets: sanitizePresetList(source.presets, now),
    selectedChannels: sanitizeSelectedChannels(source.selectedChannels, now),
    lastSuccessfulSendAt,
    lastSentPresetId: typeof source.lastSentPresetId === "string" && source.lastSentPresetId.length > 0 ? source.lastSentPresetId : null,
    lastSentMessageContent: typeof source.lastSentMessageContent === "string" && source.lastSentMessageContent.length > 0 ? source.lastSentMessageContent : null,
    currentIntervalSeconds: validatedInterval,
    nextDueAt,
    pendingMessage: Boolean(source.pendingMessage),
    pendingFromInactivity: Boolean(source.pendingFromInactivity)
  };
}
function createValencedStorageBackend() {
  const memoryFallback = {};
  const resolveHostStorage = () => {
    try {
      const globalAny = globalThis;
      if (globalAny?.valenced?.storage && typeof globalAny.valenced.storage === "object") {
        return globalAny.valenced.storage;
      }
      if (globalAny?.vendetta?.plugin?.storage && typeof globalAny.vendetta.plugin.storage === "object") {
        return globalAny.vendetta.plugin.storage;
      }
    } catch {}
    return null;
  };
  return {
    getItem(key) {
      const host = resolveHostStorage();
      if (host && key in host) return host[key];
      return memoryFallback[key];
    },
    setItem(key, value) {
      memoryFallback[key] = value;
      const host = resolveHostStorage();
      if (host) host[key] = value;
    }
  };
}
var StorageManager = class {
  constructor(options) {
    this.listeners = new Set();
    this.backend = options?.backend ?? createValencedStorageBackend();
    this.now = options?.now ?? Date.now;
    this.state = this.loadFromBackend();
  }
  loadFromBackend() {
    try {
      const raw = this.backend.getItem(STORAGE_NAMESPACE_KEY);
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      const sanitized = sanitizePersistedState(parsed, this.now());
      this.backend.setItem(STORAGE_NAMESPACE_KEY, sanitized);
      return sanitized;
    } catch {
      const fallback = createDefaultState(this.now());
      try {
        this.backend.setItem(STORAGE_NAMESPACE_KEY, fallback);
      } catch {}
      return fallback;
    }
  }
  getState() {
    return {
      ...this.state,
      presets: this.state.presets.map((p) => ({ ...p })),
      selectedChannels: { ...this.state.selectedChannels }
    };
  }
  updateState(updater) {
    const nextCandidate = typeof updater === "function" ? updater(this.getState()) : { ...this.state, ...updater };
    this.state = sanitizePersistedState(nextCandidate, this.now());
    try {
      this.backend.setItem(STORAGE_NAMESPACE_KEY, this.state);
    } catch {}
    const snapshot = this.getState();
    for (const listener of this.listeners) {
      try {
        listener(snapshot);
      } catch {}
    }
    return snapshot;
  }
  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
};

function createFallbackWithProps(...props) {
  return (mod) => {
    if (!mod || typeof mod !== "object" && typeof mod !== "function") return false;
    const record = mod;
    const defaultExport = record.default && (typeof record.default === "object" || typeof record.default === "function") ? record.default : null;
    return props.every((prop) => prop in record) || defaultExport !== null && props.every((prop) => prop in defaultExport);
  };
}
function resolveFinders() {
  let lookupModule = null;
  let withProps = createFallbackWithProps;
  try {
    if (typeof require === "function") {
      try {
        const finders = require("@valenced/modules/finders");
        if (typeof finders?.lookupModule === "function") lookupModule = finders.lookupModule;
      } catch {}
      try {
        const filters = require("@valenced/modules/finders/filters");
        if (typeof filters?.withProps === "function") withProps = filters.withProps;
      } catch {}
    }
  } catch {}
  if (!lookupModule) {
    const globalAny = globalThis;
    const candidateLookup = globalAny?.valenced?.modules?.finders?.lookupModule ?? globalAny?.valenced?.metro?.findModule ?? globalAny?.vendetta?.metro?.find;
    if (typeof candidateLookup === "function") lookupModule = candidateLookup;
    const candidateWithProps = globalAny?.valenced?.modules?.finders?.filters?.withProps ?? globalAny?.vendetta?.metro?.common?.findByProps;
    if (typeof candidateWithProps === "function") withProps = candidateWithProps;
  }
  return { lookupModule, withProps };
}
function unwrapModuleWithProp(rawModule, requiredProp) {
  if (!rawModule) return null;
  if (typeof rawModule[requiredProp] === "function") return rawModule;
  if (rawModule.default && typeof rawModule.default[requiredProp] === "function") {
    return rawModule.default;
  }
  return null;
}
var MessageActionsDiscovery = class {
  constructor(options) {
    this.cachedMessageActions = null;
    this.cachedOptionsProvider = null;
    this.customLookup = options?.lookupModule ?? null;
    this.customWithProps = options?.withProps ?? null;
  }
  getFinders() {
    const resolved = resolveFinders();
    return {
      lookupModule: this.customLookup ?? resolved.lookupModule,
      withProps: this.customWithProps ?? resolved.withProps
    };
  }
  getMessageActions() {
    if (this.cachedMessageActions && typeof this.cachedMessageActions.sendMessage === "function") {
      return this.cachedMessageActions;
    }
    const { lookupModule, withProps } = this.getFinders();
    if (!lookupModule) return null;
    const rawModule = lookupModule(withProps("receiveMessage", "sendMessage"));
    const unwrapped = unwrapModuleWithProp(rawModule, "sendMessage");
    if (unwrapped) {
      this.cachedMessageActions = unwrapped;
      return unwrapped;
    }
    return null;
  }
  resolveSendMessageOptions(params) {
    const actions = this.getMessageActions();
    if (actions && typeof actions.getSendMessageOptions === "function") {
      try {
        const opts = actions.getSendMessageOptions({
          channelId: params.channelId,
          content: params.content
        });
        if (opts && typeof opts === "object") return opts;
      } catch {}
    }
    if (!this.cachedOptionsProvider) {
      const { lookupModule, withProps } = this.getFinders();
      if (lookupModule) {
        const rawOptionsMod = lookupModule(withProps("getSendMessageOptions"));
        this.cachedOptionsProvider = unwrapModuleWithProp(rawOptionsMod, "getSendMessageOptions");
      }
    }
    if (this.cachedOptionsProvider && typeof this.cachedOptionsProvider.getSendMessageOptions === "function") {
      try {
        const opts = this.cachedOptionsProvider.getSendMessageOptions({
          channelId: params.channelId,
          content: params.content
        });
        if (opts && typeof opts === "object") return opts;
      } catch {
        return {};
      }
    }
    return {};
  }
  clearCache() {
    this.cachedMessageActions = null;
    this.cachedOptionsProvider = null;
  }
};

var MessageSender = class {
  constructor(options) {
    this.discovery = options.messageActionsDiscovery;
    this.verifyLiveChannelEligibility = options.verifyLiveChannelEligibility;
  }
  async sendToCurrentEligibleChannel(rawContent, expectedChannelId) {
    const content = sanitizePresetContent(rawContent);
    if (!content) {
      return {
        ok: false,
        channelId: expectedChannelId,
        content: rawContent,
        errorMessage: "Preset message content is empty or invalid."
      };
    }
    const actions = this.discovery.getMessageActions();
    if (!actions || typeof actions.sendMessage !== "function") {
      return {
        ok: false,
        channelId: expectedChannelId,
        content,
        errorMessage: "Discord message module (receiveMessage/sendMessage) is unavailable in this Valenced session."
      };
    }
    const liveVerification = this.verifyLiveChannelEligibility();
    if (!liveVerification.eligible || !liveVerification.channelId || liveVerification.channelId !== expectedChannelId) {
      return {
        ok: false,
        channelId: liveVerification.channelId ?? expectedChannelId,
        content,
        errorMessage: liveVerification.reason ?? "Currently viewed channel changed or became ineligible before sending."
      };
    }
    const targetChannelId = liveVerification.channelId;
    const messageObject = {
      content,
      tts: false,
      invalidEmojis: [],
      validNonShortcutEmojis: []
    };
    const sendOptions = this.discovery.resolveSendMessageOptions({
      channelId: targetChannelId,
      content
    });
    try {
      const response = await Promise.resolve(
        actions.sendMessage(targetChannelId, messageObject, void 0, sendOptions)
      );
      if (response && typeof response === "object") {
        const resRecord = response;
        if (resRecord.ok === false || typeof resRecord.status === "number" && resRecord.status >= 400) {
          return {
            ok: false,
            uncertainOutcome: resRecord.status === 500 || resRecord.status === 502 || resRecord.status === 504,
            channelId: targetChannelId,
            content,
            errorMessage: `Discord rejected message send (status ${String(resRecord.status ?? "unknown")}).`
          };
        }
      }
      return {
        ok: true,
        channelId: targetChannelId,
        content
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error while sending message.";
      return {
        ok: false,
        uncertainOutcome: true,
        channelId: targetChannelId,
        content,
        errorMessage: message
      };
    }
  }
};

var SENDABLE_TEXT_CHANNEL_TYPES = new Set([0, 1, 3, 5, 10, 11, 12, 2]);
function isAnnouncementChannelType(type) {
  return type === 5 || type === 10;
}
function isSendableChannelType(type) {
  return SENDABLE_TEXT_CHANNEL_TYPES.has(type);
}
function createValencedDiscordEnvironment() {
  const resolveLookup = () => {
    let lookupModule = null;
    let withProps = (...props) => (mod) => {
      if (!mod || typeof mod !== "object" && typeof mod !== "function") return false;
      const r = mod;
      const d = r.default && typeof r.default === "object" ? r.default : null;
      return props.every((p) => p in r) || d !== null && props.every((p) => p in d);
    };
    try {
      if (typeof require === "function") {
        const finders = require("@valenced/modules/finders");
        if (typeof finders?.lookupModule === "function") lookupModule = finders.lookupModule;
        const filters = require("@valenced/modules/finders/filters");
        if (typeof filters?.withProps === "function") withProps = filters.withProps;
      }
    } catch {}
    if (!lookupModule) {
      const globalAny = globalThis;
      lookupModule = globalAny?.valenced?.modules?.finders?.lookupModule ?? globalAny?.vendetta?.metro?.find ?? null;
    }
    return { lookupModule, withProps };
  };
  const unwrap = (mod, prop) => {
    if (!mod) return null;
    if (typeof mod[prop] === "function") return mod;
    if (mod.default && typeof mod.default[prop] === "function") return mod.default;
    return null;
  };
  return {
    getCurrentlyViewedChannelId() {
      const { lookupModule, withProps } = resolveLookup();
      if (!lookupModule) return null;
      const store = unwrap(lookupModule(withProps("getChannelId", "getVoiceChannelId")), "getChannelId");
      if (!store) return null;
      try {
        const id = store.getChannelId();
        return typeof id === "string" && id.length > 0 ? id : null;
      } catch {
        return null;
      }
    },
    getChannel(channelId) {
      if (!channelId) return null;
      const { lookupModule, withProps } = resolveLookup();
      if (!lookupModule) return null;
      const store = unwrap(lookupModule(withProps("getChannel", "hasChannel")), "getChannel");
      if (!store) return null;
      try {
        const channel = store.getChannel(channelId);
        if (!channel || typeof channel.id !== "string") return null;
        return channel;
      } catch {
        return null;
      }
    },
    getAllChannels() {
      const { lookupModule, withProps } = resolveLookup();
      if (!lookupModule) return [];
      const store = unwrap(lookupModule(withProps("getChannel", "getMutableGuildChannelsForGuild")), "getChannel");
      if (!store) return [];
      try {
        if (typeof store.getMutablePrivateChannels === "function") {
          const dms = Object.values(store.getMutablePrivateChannels() ?? {});
          const guildStore = unwrap(lookupModule(withProps("getGuild", "getGuilds")), "getGuilds");
          const guilds = guildStore ? Object.values(guildStore.getGuilds() ?? {}) : [];
          const guildChannels = [];
          for (const g of guilds) {
            if (g && typeof g.id === "string") {
              const map = store.getMutableGuildChannelsForGuild(g.id) ?? {};
              guildChannels.push(...Object.values(map));
            }
          }
          return [...guildChannels, ...dms].filter((c) => c && typeof c.id === "string");
        }
      } catch {}
      return [];
    },
    getGuilds() {
      const { lookupModule, withProps } = resolveLookup();
      if (!lookupModule) return [];
      const store = unwrap(lookupModule(withProps("getGuild", "getGuilds")), "getGuilds");
      if (!store) return [];
      try {
        const map = store.getGuilds() ?? {};
        return Object.values(map).filter((g) => g && typeof g.id === "string");
      } catch {
        return [];
      }
    }
  };
}
var ChannelManager = class {
  constructor(options) {
    this.getSelectedChannels = options.getSelectedChannels;
    this.setSelectedChannels = options.setSelectedChannels;
    this.env = options.environment ?? createValencedDiscordEnvironment();
    this.now = options.now ?? Date.now;
  }
  getLiveCurrentlyViewedChannelId() {
    return this.env.getCurrentlyViewedChannelId();
  }
  isChannelSelected(channelId) {
    if (!channelId) return false;
    const selected = this.getSelectedChannels();
    return Boolean(selected[channelId]);
  }
  selectChannel(channelId, options) {
    if (!channelId || typeof channelId !== "string") return false;
    const channel = this.env.getChannel(channelId);
    if (channel && !isSendableChannelType(channel.type)) return false;
    const isAnnouncement = channel ? isAnnouncementChannelType(channel.type) : false;
    if (isAnnouncement && !options?.explicitlyAllowAnnouncement) return false;
    const current = this.getSelectedChannels();
    this.setSelectedChannels({
      ...current,
      [channelId]: {
        channelId,
        guildId: channel?.guild_id ?? null,
        isAnnouncementExplicitlyAllowed: isAnnouncement ? Boolean(options?.explicitlyAllowAnnouncement) : false,
        selectedAt: this.now()
      }
    });
    return true;
  }
  deselectChannel(channelId) {
    const current = this.getSelectedChannels();
    if (!(channelId in current)) return false;
    const next = { ...current };
    delete next[channelId];
    this.setSelectedChannels(next);
    return true;
  }
  toggleChannelSelection(channelId, options) {
    if (this.isChannelSelected(channelId)) {
      this.deselectChannel(channelId);
      return false;
    }
    return this.selectChannel(channelId, options);
  }
  verifyCurrentChannelEligibility() {
    const liveChannelId = this.env.getCurrentlyViewedChannelId();
    if (!liveChannelId) {
      return {
        eligible: false,
        channelId: null,
        reason: "No channel is currently being viewed.",
        isAnnouncement: false
      };
    }
    const selectedMap = this.getSelectedChannels();
    const selectionConfig = selectedMap[liveChannelId];
    if (!selectionConfig) {
      return {
        eligible: false,
        channelId: liveChannelId,
        reason: "Currently viewed channel is not selected in meower settings.",
        isAnnouncement: false
      };
    }
    const channel = this.env.getChannel(liveChannelId);
    if (!channel) {
      return {
        eligible: false,
        channelId: liveChannelId,
        reason: "Currently viewed channel could not be resolved in Discord ChannelStore.",
        isAnnouncement: false
      };
    }
    const isAnnouncement = isAnnouncementChannelType(channel.type);
    if (!isSendableChannelType(channel.type)) {
      return {
        eligible: false,
        channelId: liveChannelId,
        reason: "Currently viewed channel does not support text messages.",
        isAnnouncement
      };
    }
    if (isAnnouncement && !selectionConfig.isAnnouncementExplicitlyAllowed) {
      return {
        eligible: false,
        channelId: liveChannelId,
        reason: "Announcement channels are excluded unless explicitly permitted in channel selection.",
        isAnnouncement: true
      };
    }
    return {
      eligible: true,
      channelId: liveChannelId,
      reason: null,
      isAnnouncement
    };
  }
  getChannelsGroupedByServer() {
    const guilds = this.env.getGuilds();
    const guildNameById = new Map();
    for (const guild of guilds) {
      guildNameById.set(guild.id, guild.name || `Server (${guild.id})`);
    }
    const allChannels = this.env.getAllChannels();
    const selectedMap = this.getSelectedChannels();
    const groupedMap = new Map();
    for (const channel of allChannels) {
      if (!isSendableChannelType(channel.type)) continue;
      const guildId = channel.guild_id ?? "__direct_messages__";
      const guildName = guildId === "__direct_messages__" ? "Direct Messages" : guildNameById.get(guildId) ?? `Server (${guildId})`;
      let group = groupedMap.get(guildId);
      if (!group) {
        group = { guildId, guildName, channels: [] };
        groupedMap.set(guildId, group);
      }
      const selection = selectedMap[channel.id];
      const isAnnouncement = isAnnouncementChannelType(channel.type);
      const displayName = channel.name && channel.name.trim().length > 0 ? `#${channel.name}` : channel.recipients && channel.recipients.length > 0 ? channel.recipients.map((r) => r.username || r.id).join(", ") : `Channel ${channel.id}`;
      group.channels.push({
        id: channel.id,
        name: displayName,
        type: channel.type,
        isAnnouncement,
        isSelected: Boolean(selection),
        isExplicitlyAllowedAnnouncement: Boolean(selection?.isAnnouncementExplicitlyAllowed)
      });
    }
    const groups = Array.from(groupedMap.values());
    for (const group of groups) {
      group.channels.sort((a, b) => a.name.localeCompare(b.name));
    }
    groups.sort((a, b) => {
      if (a.guildId === "__direct_messages__") return 1;
      if (b.guildId === "__direct_messages__") return -1;
      return a.guildName.localeCompare(b.guildName);
    });
    return groups;
  }
};

function normalizeAppStateString(raw) {
  if (raw === "active") return "active";
  if (raw === "inactive") return "inactive";
  return "background";
}
function createReactNativeLifecycleAdapter() {
  const resolveReactNativeAppState = () => {
    try {
      if (typeof require === "function") {
        const rn = require("react-native");
        if (rn?.AppState) return rn.AppState;
      }
    } catch {}
    const globalAny = globalThis;
    return globalAny?.ReactNative?.AppState ?? null;
  };
  const resolveFluxDispatcher = () => {
    try {
      if (typeof require === "function") {
        const finders = require("@valenced/modules/finders");
        const filters = require("@valenced/modules/finders/filters");
        if (typeof finders?.lookupModule === "function" && typeof filters?.withProps === "function") {
          const mod = finders.lookupModule(filters.withProps("dispatch", "subscribe"));
          if (mod && typeof mod.subscribe === "function") return mod;
          if (mod?.default && typeof mod.default.subscribe === "function") return mod.default;
        }
      }
    } catch {}
    const globalAny = globalThis;
    return globalAny?.valenced?.flux?.FluxDispatcher ?? globalAny?.vendetta?.metro?.common?.FluxDispatcher ?? null;
  };
  return {
    getCurrentAppState() {
      const appState = resolveReactNativeAppState();
      if (appState && typeof appState.currentState === "string") {
        return normalizeAppStateString(appState.currentState);
      }
      return "active";
    },
    subscribeAppState(listener) {
      const appState = resolveReactNativeAppState();
      if (!appState || typeof appState.addEventListener !== "function") return () => {};
      const handler = (nextState) => listener(normalizeAppStateString(nextState));
      const subscription = appState.addEventListener("change", handler);
      return () => {
        try {
          if (subscription && typeof subscription.remove === "function") {
            subscription.remove();
          } else if (typeof appState.removeEventListener === "function") {
            appState.removeEventListener("change", handler);
          }
        } catch {}
      };
    },
    subscribeChannelSelect(listener) {
      const dispatcher = resolveFluxDispatcher();
      if (!dispatcher || typeof dispatcher.subscribe !== "function") return () => {};
      const handler = (event) => {
        const channelId = typeof event?.channelId === "string" ? event.channelId : null;
        listener(channelId);
      };
      try {
        dispatcher.subscribe("CHANNEL_SELECT", handler);
      } catch {
        return () => {};
      }
      return () => {
        try {
          if (typeof dispatcher.unsubscribe === "function") {
            dispatcher.unsubscribe("CHANNEL_SELECT", handler);
          }
        } catch {}
      };
    }
  };
}
var LifecycleMonitor = class {
  constructor(adapter) {
    this.started = false;
    this.cleanups = [];
    this.activeChangeCallbacks = new Set();
    this.channelChangeCallbacks = new Set();
    this.adapter = adapter ?? createReactNativeLifecycleAdapter();
    this.isActiveState = this.adapter.getCurrentAppState() === "active";
  }
  start() {
    if (this.started) return;
    this.started = true;
    this.isActiveState = this.adapter.getCurrentAppState() === "active";
    const unsubApp = this.adapter.subscribeAppState((nextState) => {
      const nextActive = nextState === "active";
      if (nextActive === this.isActiveState) return;
      this.isActiveState = nextActive;
      for (const cb of this.activeChangeCallbacks) {
        try {
          cb(nextActive);
        } catch {}
      }
    });
    const unsubChannel = this.adapter.subscribeChannelSelect((channelId) => {
      for (const cb of this.channelChangeCallbacks) {
        try {
          cb(channelId);
        } catch {}
      }
    });
    this.cleanups.push(unsubApp, unsubChannel);
  }
  stop() {
    if (!this.started) return;
    this.started = false;
    while (this.cleanups.length > 0) {
      const fn = this.cleanups.pop();
      try {
        fn?.();
      } catch {}
    }
  }
  isAppActive() {
    return this.isActiveState;
  }
  onActiveStateChange(callback) {
    this.activeChangeCallbacks.add(callback);
    return () => this.activeChangeCallbacks.delete(callback);
  }
  onChannelChange(callback) {
    this.channelChangeCallbacks.add(callback);
    return () => this.channelChangeCallbacks.delete(callback);
  }
};

var defaultTimerHost = {
  setTimeout: (cb, ms) => globalThis.setTimeout(cb, ms),
  clearTimeout: (handle) => globalThis.clearTimeout(handle)
};
function generateRandomIntervalSeconds(random = Math.random) {
  const span = MAX_INTERVAL_SECONDS - MIN_INTERVAL_SECONDS + 1;
  const raw = random();
  const safeRandom = Number.isFinite(raw) && raw >= 0 && raw < 1 ? raw : Math.random();
  const offset = Math.floor(safeRandom * span);
  const candidate = MIN_INTERVAL_SECONDS + offset;
  return Math.min(MAX_INTERVAL_SECONDS, Math.max(MIN_INTERVAL_SECONDS, candidate));
}
var MeowerScheduler = class {
  constructor(options) {
    this.isRunning = false;
    this.isSending = false;
    this.activeDueTimer = null;
    this.activeGraceTimer = null;
    this.activeBackoffTimer = null;
    this.gracePeriodEndsAt = null;
    this.errorBackoffUntil = null;
    this.lastError = null;
    this.lastErrorAt = null;
    this.lifecycleUnsubscribers = [];
    this.statusListeners = new Set();
    this.storage = options.storage;
    this.presets = options.presets;
    this.channels = options.channels;
    this.sender = options.sender;
    this.lifecycle = options.lifecycle;
    this.now = options.now ?? Date.now;
    this.random = options.random ?? Math.random;
    this.timers = options.timers ?? defaultTimerHost;
  }
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lifecycle.start();
    this.lifecycleUnsubscribers.push(
      this.lifecycle.onActiveStateChange((isActive) => {
        if (isActive) {
          this.handleReturnToForeground();
        } else {
          this.handleTransitionToBackground();
        }
      }),
      this.lifecycle.onChannelChange(() => {
        this.handleChannelChange();
      })
    );
    const state = this.storage.getState();
    if (!state.enabled) {
      this.clearAllTimers();
      this.notifyStatusListeners();
      return;
    }
    this.recoverScheduleOnStartup();
    this.notifyStatusListeners();
  }
  stop() {
    this.isRunning = false;
    this.clearAllTimers();
    this.gracePeriodEndsAt = null;
    this.errorBackoffUntil = null;
    while (this.lifecycleUnsubscribers.length > 0) {
      const unsub = this.lifecycleUnsubscribers.pop();
      try {
        unsub?.();
      } catch {}
    }
    this.lifecycle.stop();
    this.notifyStatusListeners();
  }
  setPluginEnabled(enabled) {
    this.storage.updateState({ enabled });
    if (!enabled) {
      this.clearAllTimers();
      this.gracePeriodEndsAt = null;
      this.errorBackoffUntil = null;
      this.notifyStatusListeners();
      return;
    }
    if (this.isRunning) {
      this.recoverScheduleOnStartup();
      this.notifyStatusListeners();
    }
  }
  clearAllTimers() {
    if (this.activeDueTimer !== null) {
      this.timers.clearTimeout(this.activeDueTimer);
      this.activeDueTimer = null;
    }
    if (this.activeGraceTimer !== null) {
      this.timers.clearTimeout(this.activeGraceTimer);
      this.activeGraceTimer = null;
    }
    if (this.activeBackoffTimer !== null) {
      this.timers.clearTimeout(this.activeBackoffTimer);
      this.activeBackoffTimer = null;
    }
  }
  recoverScheduleOnStartup() {
    this.clearAllTimers();
    const now = this.now();
    const state = this.storage.getState();
    if (!state.enabled) return;
    const validInterval = validateIntervalSeconds(state.currentIntervalSeconds);
    if (state.pendingMessage || state.nextDueAt !== null && now >= state.nextDueAt) {
      this.storage.updateState({
        pendingMessage: true,
        pendingFromInactivity: true,
        currentIntervalSeconds: validInterval ?? generateRandomIntervalSeconds(this.random)
      });
      if (this.lifecycle.isAppActive()) {
        this.startForegroundGracePeriod();
      }
      return;
    }
    if (state.nextDueAt !== null && state.nextDueAt > now && validInterval !== null) {
      if (this.lifecycle.isAppActive()) {
        this.scheduleDueTimer(state.nextDueAt - now);
      }
      return;
    }
    const initialIntervalSeconds = generateRandomIntervalSeconds(this.random);
    const nextDueAt = now + initialIntervalSeconds * 1e3;
    this.storage.updateState({
      currentIntervalSeconds: initialIntervalSeconds,
      nextDueAt,
      pendingMessage: false,
      pendingFromInactivity: false
    });
    if (this.lifecycle.isAppActive()) {
      this.scheduleDueTimer(initialIntervalSeconds * 1e3);
    }
  }
  handleTransitionToBackground() {
    this.clearAllTimers();
    this.gracePeriodEndsAt = null;
    this.errorBackoffUntil = null;
    const now = this.now();
    const state = this.storage.getState();
    if (state.pendingMessage || state.nextDueAt !== null && now >= state.nextDueAt) {
      this.storage.updateState({
        pendingMessage: true,
        pendingFromInactivity: true
      });
    }
    this.notifyStatusListeners();
  }
  handleReturnToForeground() {
    this.clearAllTimers();
    const now = this.now();
    const state = this.storage.getState();
    if (!this.isRunning || !state.enabled) {
      this.notifyStatusListeners();
      return;
    }
    if (state.pendingMessage || state.pendingFromInactivity || state.nextDueAt !== null && now >= state.nextDueAt) {
      this.storage.updateState({
        pendingMessage: true,
        pendingFromInactivity: true
      });
      this.startForegroundGracePeriod();
      this.notifyStatusListeners();
      return;
    }
    if (state.nextDueAt !== null && state.nextDueAt > now) {
      this.scheduleDueTimer(state.nextDueAt - now);
    } else {
      this.recoverScheduleOnStartup();
    }
    this.notifyStatusListeners();
  }
  startForegroundGracePeriod() {
    if (this.activeGraceTimer !== null) {
      this.timers.clearTimeout(this.activeGraceTimer);
      this.activeGraceTimer = null;
    }
    const now = this.now();
    this.gracePeriodEndsAt = now + FOREGROUND_GRACE_PERIOD_MS;
    this.activeGraceTimer = this.timers.setTimeout(() => {
      this.activeGraceTimer = null;
      this.onGracePeriodElapsed();
    }, FOREGROUND_GRACE_PERIOD_MS);
  }
  onGracePeriodElapsed() {
    if (!this.isRunning || !this.lifecycle.isAppActive()) return;
    const now = this.now();
    if (this.gracePeriodEndsAt !== null && now < this.gracePeriodEndsAt) {
      this.scheduleGraceRemainder(this.gracePeriodEndsAt - now);
      return;
    }
    this.gracePeriodEndsAt = null;
    this.storage.updateState({
      pendingMessage: true,
      pendingFromInactivity: false
    });
    void this.evaluateAndSendIfEligible();
  }
  scheduleGraceRemainder(remainingMs) {
    if (this.activeGraceTimer !== null) {
      this.timers.clearTimeout(this.activeGraceTimer);
    }
    this.activeGraceTimer = this.timers.setTimeout(() => {
      this.activeGraceTimer = null;
      this.onGracePeriodElapsed();
    }, Math.max(1, remainingMs));
  }
  scheduleDueTimer(delayMs) {
    if (this.activeDueTimer !== null) {
      this.timers.clearTimeout(this.activeDueTimer);
      this.activeDueTimer = null;
    }
    const safeDelay = Math.max(1, Math.min(delayMs, MAX_INTERVAL_SECONDS * 1e3));
    this.activeDueTimer = this.timers.setTimeout(() => {
      this.activeDueTimer = null;
      this.onForegroundIntervalElapsed();
    }, safeDelay);
  }
  onForegroundIntervalElapsed() {
    if (!this.isRunning || !this.lifecycle.isAppActive()) return;
    const now = this.now();
    const state = this.storage.getState();
    if (!state.enabled) return;
    if (state.nextDueAt !== null && now < state.nextDueAt) {
      this.scheduleDueTimer(state.nextDueAt - now);
      return;
    }
    this.storage.updateState({
      pendingMessage: true,
      pendingFromInactivity: false
    });
    void this.evaluateAndSendIfEligible();
  }
  handleChannelChange() {
    if (!this.isRunning || !this.lifecycle.isAppActive()) {
      this.notifyStatusListeners();
      return;
    }
    const state = this.storage.getState();
    if (!state.enabled || this.isGracePeriodActive()) {
      this.notifyStatusListeners();
      return;
    }
    const now = this.now();
    if (state.pendingMessage || state.nextDueAt !== null && now >= state.nextDueAt && !state.pendingFromInactivity) {
      void this.evaluateAndSendIfEligible();
    } else {
      this.notifyStatusListeners();
    }
  }
  isGracePeriodActive() {
    if (this.gracePeriodEndsAt === null) return false;
    return this.now() < this.gracePeriodEndsAt;
  }
  async evaluateAndSendIfEligible() {
    if (this.isSending) return false;
    const now = this.now();
    const state = this.storage.getState();
    if (!this.isRunning || !state.enabled) {
      this.notifyStatusListeners();
      return false;
    }
    if (!this.lifecycle.isAppActive() || this.isGracePeriodActive()) {
      this.notifyStatusListeners();
      return false;
    }
    if (this.errorBackoffUntil !== null && now < this.errorBackoffUntil) {
      this.notifyStatusListeners();
      return false;
    }
    const isDueElapsed = state.pendingMessage || state.nextDueAt !== null && now >= state.nextDueAt;
    if (!isDueElapsed) {
      this.notifyStatusListeners();
      return false;
    }
    if (state.lastSuccessfulSendAt !== null && now - state.lastSuccessfulSendAt < MIN_INTERVAL_SECONDS * 1e3) {
      const remainingToMin = state.lastSuccessfulSendAt + MIN_INTERVAL_SECONDS * 1e3 - now;
      this.scheduleDueTimer(remainingToMin);
      this.notifyStatusListeners();
      return false;
    }
    const channelEligibility = this.channels.verifyCurrentChannelEligibility();
    if (!channelEligibility.eligible || !channelEligibility.channelId) {
      if (!state.pendingMessage) {
        this.storage.updateState({
          pendingMessage: true,
          pendingFromInactivity: false
        });
      }
      this.notifyStatusListeners();
      return false;
    }
    const chosenPreset = this.presets.selectNextMessage(
      state.lastSentPresetId,
      state.lastSentMessageContent,
      this.random
    );
    if (!chosenPreset) {
      this.lastError = "No enabled message presets are available to send.";
      this.lastErrorAt = now;
      this.notifyStatusListeners();
      return false;
    }
    this.isSending = true;
    this.notifyStatusListeners();
    try {
      const sendResult = await this.sender.sendToCurrentEligibleChannel(
        chosenPreset.content,
        channelEligibility.channelId
      );
      const completedAt = this.now();
      if (!sendResult.ok) {
        this.lastError = sendResult.errorMessage ?? "Message send failed.";
        this.lastErrorAt = completedAt;
        this.errorBackoffUntil = completedAt + SEND_ERROR_BACKOFF_MS;
        this.storage.updateState({ pendingMessage: true });
        if (this.activeBackoffTimer !== null) {
          this.timers.clearTimeout(this.activeBackoffTimer);
        }
        this.activeBackoffTimer = this.timers.setTimeout(() => {
          this.activeBackoffTimer = null;
          this.errorBackoffUntil = null;
          if (this.isRunning && this.lifecycle.isAppActive()) {
            void this.evaluateAndSendIfEligible();
          }
        }, SEND_ERROR_BACKOFF_MS);
        return false;
      }
      const nextIntervalSeconds = generateRandomIntervalSeconds(this.random);
      const nextDueAt = completedAt + nextIntervalSeconds * 1e3;
      this.lastError = null;
      this.lastErrorAt = null;
      this.errorBackoffUntil = null;
      this.storage.updateState({
        lastSuccessfulSendAt: completedAt,
        lastSentPresetId: chosenPreset.id,
        lastSentMessageContent: chosenPreset.content,
        currentIntervalSeconds: nextIntervalSeconds,
        nextDueAt,
        pendingMessage: false,
        pendingFromInactivity: false
      });
      if (this.isRunning && this.lifecycle.isAppActive()) {
        this.scheduleDueTimer(nextIntervalSeconds * 1e3);
      }
      return true;
    } finally {
      this.isSending = false;
      this.notifyStatusListeners();
    }
  }
  getRuntimeStatus() {
    const now = this.now();
    const state = this.storage.getState();
    const isAppActive = this.lifecycle.isAppActive();
    const channelCheck = this.channels.verifyCurrentChannelEligibility();
    const graceActive = this.gracePeriodEndsAt !== null && now < this.gracePeriodEndsAt;
    const graceRemainingMs = graceActive ? Math.max(0, this.gracePeriodEndsAt - now) : 0;
    let phase = "waiting_for_interval";
    if (!state.enabled || !this.isRunning) {
      phase = "disabled";
    } else if (this.isSending) {
      phase = "sending";
    } else if (!isAppActive) {
      phase = "inactive_paused";
    } else if (graceActive) {
      phase = "grace_period";
    } else if (this.errorBackoffUntil !== null && now < this.errorBackoffUntil) {
      phase = "error_backoff";
    } else if (state.pendingMessage) {
      phase = "pending_awaiting_eligible_channel";
    }
    return {
      phase,
      enabled: state.enabled,
      isAppActive,
      isSending: this.isSending,
      lastSuccessfulSendAt: state.lastSuccessfulSendAt,
      lastSentPresetId: state.lastSentPresetId,
      lastSentMessageContent: state.lastSentMessageContent,
      currentIntervalSeconds: state.currentIntervalSeconds,
      nextDueAt: state.nextDueAt,
      pendingMessage: state.pendingMessage,
      pendingFromInactivity: state.pendingFromInactivity,
      gracePeriodEndsAt: graceActive ? this.gracePeriodEndsAt : null,
      gracePeriodRemainingMs: graceRemainingMs,
      currentlyViewedChannelId: channelCheck.channelId,
      isCurrentChannelEligible: channelCheck.eligible,
      currentChannelRejectionReason: channelCheck.reason,
      lastError: this.lastError,
      lastErrorAt: this.lastErrorAt
    };
  }
  subscribeStatus(listener) {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }
  notifyStatusListeners() {
    if (this.statusListeners.size === 0) return;
    const status = this.getRuntimeStatus();
    for (const listener of this.statusListeners) {
      try {
        listener(status);
      } catch {}
    }
  }
};

function formatTimestamp(ts) {
  if (ts === null || !Number.isFinite(ts)) return "Never";
  try {
    return new Date(ts).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  } catch {
    return new Date(ts).toISOString();
  }
}
function formatDurationSeconds(seconds) {
  if (seconds === null || !Number.isFinite(seconds)) return "Not scheduled";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hrs}h ${remMins}m ${secs}s (${seconds}s)`;
  }
  return `${mins}m ${secs}s (${seconds}s)`;
}
function formatPhaseLabel(status) {
  switch (status.phase) {
    case "disabled":
      return "Disabled";
    case "inactive_paused":
      return "Paused (Valenced Inactive)";
    case "grace_period": {
      const remSec = Math.ceil(status.gracePeriodRemainingMs / 1e3);
      return `Foreground Grace Period (${formatDurationSeconds(remSec)} remaining)`;
    }
    case "sending":
      return "Sending meow...";
    case "error_backoff":
      return "Retry Cooldown (Send Failed)";
    case "pending_awaiting_eligible_channel":
      return "Pending (Awaiting Viewed Selected Channel)";
    case "waiting_for_interval":
      return "Active & Scheduled";
  }
}
var DARK_THEME = {
  background: "#0f1115",
  surface: "#171a21",
  surfaceElevated: "#1f242d",
  border: "#2a303c",
  textPrimary: "#f0f3f8",
  textSecondary: "#9ba3b0",
  textMuted: "#6c7483",
  accent: "#d484ff",
  success: "#43b581",
  warning: "#faa61a",
  danger: "#f04747"
};
function resolveReactAndRN() {
  let React = null;
  let RN = null;
  try {
    if (typeof require === "function") {
      React = require("react");
      RN = require("react-native");
    }
  } catch {}
  const globalAny = globalThis;
  React = React ?? globalAny?.React;
  RN = RN ?? globalAny?.ReactNative;
  return { React, RN };
}
function createSettingsComponent(deps) {
  return function MeowerSettingsScreen() {
    const { React, RN } = resolveReactAndRN();
    if (!React || !RN) return null;
    const { ScrollView, View, Text, TextInput, Pressable, Switch } = RN;
    const [status, setStatus] = React.useState(() => deps.scheduler.getRuntimeStatus());
    const [presets, setPresets] = React.useState(() => deps.presets.listPresets());
    const [channelGroups, setChannelGroups] = React.useState(() => deps.channels.getChannelsGroupedByServer());
    const [newPresetText, setNewPresetText] = React.useState("");
    const [editingPresetId, setEditingPresetId] = React.useState(null);
    const [editingPresetText, setEditingPresetText] = React.useState("");
    const [uiError, setUiError] = React.useState(null);
    React.useEffect(() => {
      const refreshAll = () => {
        setStatus(deps.scheduler.getRuntimeStatus());
        setPresets(deps.presets.listPresets());
        setChannelGroups(deps.channels.getChannelsGroupedByServer());
      };
      const unsubStorage = deps.storage.subscribe(refreshAll);
      const unsubStatus = deps.scheduler.subscribeStatus((nextStatus) => setStatus(nextStatus));
      const uiTicker = setInterval(() => setStatus(deps.scheduler.getRuntimeStatus()), 2e3);
      return () => {
        unsubStorage();
        unsubStatus();
        clearInterval(uiTicker);
      };
    }, []);
    const sectionStyle = {
      backgroundColor: DARK_THEME.surface,
      borderColor: DARK_THEME.border,
      borderWidth: 1,
      borderRadius: 10,
      padding: 14,
      marginBottom: 14
    };
    const rowStyle = {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 6
    };
    const h = React.createElement;
    return h(
      ScrollView,
      { style: { flex: 1, backgroundColor: DARK_THEME.background, padding: 14 } },
      h(
        View,
        { style: sectionStyle },
        h(
          View,
          { style: rowStyle },
          h(Text, { style: { color: DARK_THEME.textPrimary, fontSize: 17, fontWeight: "600" } }, "meower"),
          h(Switch, {
            value: status.enabled,
            onValueChange: (val) => {
              setUiError(null);
              deps.scheduler.setPluginEnabled(val);
            }
          })
        ),
        h(Text, { style: { color: DARK_THEME.textSecondary, fontSize: 13, marginTop: 6 } }, `Status: ${formatPhaseLabel(status)}`),
        h(Text, { style: { color: DARK_THEME.textSecondary, fontSize: 13, marginTop: 4 } }, `Last Successful: ${formatTimestamp(status.lastSuccessfulSendAt)}`),
        h(Text, { style: { color: DARK_THEME.textSecondary, fontSize: 13, marginTop: 4 } }, `Next Scheduled: ${formatTimestamp(status.nextDueAt)}`),
        h(Text, { style: { color: DARK_THEME.textSecondary, fontSize: 13, marginTop: 4 } }, `Pending Message: ${status.pendingMessage ? "Yes (1)" : "No"}`),
        status.lastError ? h(Text, { style: { color: DARK_THEME.danger, fontSize: 12, marginTop: 4 } }, status.lastError) : null
      ),
      h(
        View,
        { style: sectionStyle },
        h(Text, { style: { color: DARK_THEME.textPrimary, fontSize: 15, fontWeight: "600", marginBottom: 6 } }, "Scheduler Bounds (Locked)"),
        h(Text, { style: { color: DARK_THEME.textSecondary, fontSize: 13 } }, `Min: ${MIN_INTERVAL_SECONDS}s (10m) | Max: ${MAX_INTERVAL_SECONDS}s (2h)`),
        h(Text, { style: { color: DARK_THEME.textSecondary, fontSize: 13, marginTop: 4 } }, `Current Interval: ${formatDurationSeconds(status.currentIntervalSeconds)}`)
      ),
      h(
        View,
        { style: sectionStyle },
        h(Text, { style: { color: DARK_THEME.textPrimary, fontSize: 15, fontWeight: "600", marginBottom: 6 } }, "Channel Selection"),
        ...channelGroups.map((group) =>
          h(
            View,
            { key: group.guildId, style: { marginTop: 8 } },
            h(Text, { style: { color: DARK_THEME.textPrimary, fontSize: 13, fontWeight: "600" } }, group.guildName),
            ...group.channels.map((ch) =>
              h(
                View,
                { key: ch.id, style: rowStyle },
                h(Text, { style: { color: ch.isSelected ? DARK_THEME.accent : DARK_THEME.textPrimary, fontSize: 13 } }, `${ch.name}${ch.isAnnouncement ? " [Announcement]" : ""}`),
                h(Switch, {
                  value: ch.isSelected,
                  onValueChange: () => {
                    deps.channels.toggleChannelSelection(ch.id, { explicitlyAllowAnnouncement: ch.isAnnouncement });
                    setChannelGroups(deps.channels.getChannelsGroupedByServer());
                    deps.scheduler.handleChannelChange();
                  }
                })
              )
            )
          )
        )
      ),
      h(
        View,
        { style: sectionStyle },
        h(
          View,
          { style: rowStyle },
          h(Text, { style: { color: DARK_THEME.textPrimary, fontSize: 15, fontWeight: "600" } }, "Message Presets"),
          h(
            Pressable,
            {
              onPress: () => {
                deps.presets.restoreDefaults();
                setPresets(deps.presets.listPresets());
              }
            },
            h(Text, { style: { color: DARK_THEME.accent, fontSize: 12 } }, "Restore Defaults")
          )
        ),
        uiError ? h(Text, { style: { color: DARK_THEME.danger, fontSize: 12 } }, uiError) : null,
        h(
          View,
          { style: rowStyle },
          h(TextInput, {
            value: newPresetText,
            onChangeText: setNewPresetText,
            placeholder: "New cat preset...",
            style: { flex: 1, color: DARK_THEME.textPrimary, backgroundColor: DARK_THEME.surfaceElevated, padding: 6, borderRadius: 6, marginRight: 8 }
          }),
          h(
            Pressable,
            {
              onPress: () => {
                try {
                  deps.presets.addCustomPreset(newPresetText);
                  setNewPresetText("");
                  setPresets(deps.presets.listPresets());
                } catch (e) {
                  setUiError(e instanceof Error ? e.message : "Invalid preset");
                }
              }
            },
            h(Text, { style: { color: DARK_THEME.accent, fontSize: 13 } }, "Add")
          )
        ),
        ...presets.map((p) =>
          h(
            View,
            { key: p.id, style: rowStyle },
            editingPresetId === p.id
              ? h(
                  View,
                  { style: rowStyle },
                  h(TextInput, {
                    value: editingPresetText,
                    onChangeText: setEditingPresetText,
                    style: { flex: 1, color: DARK_THEME.textPrimary, backgroundColor: DARK_THEME.surfaceElevated, padding: 6, marginRight: 8 }
                  }),
                  h(
                    Pressable,
                    {
                      onPress: () => {
                        deps.presets.editPreset(p.id, editingPresetText);
                        setEditingPresetId(null);
                        setPresets(deps.presets.listPresets());
                      }
                    },
                    h(Text, { style: { color: DARK_THEME.success, fontSize: 12 } }, "Save")
                  )
                )
              : h(
                  View,
                  { style: rowStyle },
                  h(Text, { style: { color: p.enabled ? DARK_THEME.textPrimary : DARK_THEME.textMuted, fontSize: 13, flex: 1 } }, p.content),
                  h(
                    Pressable,
                    {
                      onPress: () => {
                        setEditingPresetId(p.id);
                        setEditingPresetText(p.content);
                      },
                      style: { marginRight: 10 }
                    },
                    h(Text, { style: { color: DARK_THEME.textSecondary, fontSize: 12 } }, "Edit")
                  ),
                  h(
                    Pressable,
                    {
                      onPress: () => {
                        deps.presets.deletePreset(p.id);
                        setPresets(deps.presets.listPresets());
                      },
                      style: { marginRight: 10 }
                    },
                    h(Text, { style: { color: DARK_THEME.danger, fontSize: 12 } }, "Delete")
                  ),
                  h(Switch, {
                    value: p.enabled,
                    onValueChange: (val) => {
                      deps.presets.togglePreset(p.id, val);
                      setPresets(deps.presets.listPresets());
                    }
                  })
                )
          )
        )
      )
    );
  };
}

function createMeowerPlugin(options) {
  const now = options?.now ?? Date.now;
  const random = options?.random ?? Math.random;
  const storage = new StorageManager({ backend: options?.storageBackend, now });
  const presets = new PresetManager({
    getPresets: () => storage.getState().presets,
    setPresets: (nextPresets) => storage.updateState({ presets: nextPresets }),
    now
  });
  const channels = new ChannelManager({
    getSelectedChannels: () => storage.getState().selectedChannels,
    setSelectedChannels: (nextChannels) => storage.updateState({ selectedChannels: nextChannels }),
    environment: options?.channelEnvironment,
    now
  });
  const messageActions = new MessageActionsDiscovery({
    lookupModule: options?.lookupModule,
    withProps: options?.withProps
  });
  const sender = new MessageSender({
    messageActionsDiscovery: messageActions,
    verifyLiveChannelEligibility: () => channels.verifyCurrentChannelEligibility()
  });
  const lifecycle = new LifecycleMonitor(options?.lifecycleAdapter);
  const scheduler = new MeowerScheduler({
    storage,
    presets,
    channels,
    sender,
    lifecycle,
    now,
    random,
    timers: options?.timers
  });
  const SettingsComponent = createSettingsComponent({ storage, presets, channels, scheduler });
  const start = () => scheduler.start();
  const stop = () => {
    scheduler.stop();
    messageActions.clearCache();
  };
  return {
    storage,
    presets,
    channels,
    messageActions,
    sender,
    lifecycle,
    scheduler,
    settings: SettingsComponent,
    start,
    stop,
    onLoad: start,
    onUnload: stop
  };
}
var activeSingleton = null;
function getOrCreateSingleton() {
  if (!activeSingleton) activeSingleton = createMeowerPlugin();
  return activeSingleton;
}
var meowerPlugin = {
  onLoad() {
    getOrCreateSingleton().onLoad();
  },
  onUnload() {
    if (activeSingleton) activeSingleton.onUnload();
  },
  start() {
    getOrCreateSingleton().start();
  },
  stop() {
    if (activeSingleton) activeSingleton.stop();
  },
  get settings() {
    return getOrCreateSingleton().settings;
  }
};
var src_default = meowerPlugin;


export default meowerPlugin;
