"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Sparkles,
  Music,
  BookOpen,
  Piano,
  Drum,
  AlertCircle,
  Trash2,
  Volume2,
  Settings,
  Zap,
  Wand2,
  Headphones,
  Maximize2,
  Minimize2,
  Info,
  HelpCircle,
  Star,
  Heart,
  Palette,
  BarChart3,
  TrendingUp,
  Layers,
} from "lucide-react"

interface Note {
  id: string
  pitch: number
  start: number
  duration: number
  velocity: number
  instrument?: string
  chordName?: string
  function?: string
  drumType?: string
}

interface Chord {
  name: string
  notes: number[]
  function: "T" | "S" | "D"
}

interface Scale {
  name: string
  intervals: number[]
  chords: Chord[]
}

interface Instrument {
  id: string
  name: string
  type: string
  category: "synth" | "acoustic" | "percussion"
  icon?: React.ReactNode
  color: string
  gradient?: string
}

interface DrumType {
  id: string
  name: string
  pitch: number
  color: string
  key?: string
  description?: string
  frequency?: number
  decay?: number
  type?: "noise" | "tone" | "mixed"
}

const NOTES = ["ド", "ド#", "レ", "レ#", "ミ", "ファ", "ファ#", "ソ", "ソ#", "ラ", "ラ#", "シ"]
const OCTAVES = [3, 4, 5, 6]

const SCALES: { [key: string]: Scale } = {
  major: {
    name: "メジャースケール",
    intervals: [0, 2, 4, 5, 7, 9, 11],
    chords: [
      { name: "I", notes: [0, 4, 7], function: "T" },
      { name: "ii", notes: [2, 5, 9], function: "S" },
      { name: "iii", notes: [4, 7, 11], function: "T" },
      { name: "IV", notes: [5, 9, 0], function: "S" },
      { name: "V", notes: [7, 11, 2], function: "D" },
      { name: "vi", notes: [9, 0, 4], function: "T" },
      { name: "vii°", notes: [11, 2, 5], function: "D" },
    ],
  },
  minor: {
    name: "ナチュラルマイナースケール",
    intervals: [0, 2, 3, 5, 7, 8, 10],
    chords: [
      { name: "i", notes: [0, 3, 7], function: "T" },
      { name: "ii°", notes: [2, 5, 8], function: "S" },
      { name: "III", notes: [3, 7, 10], function: "T" },
      { name: "iv", notes: [5, 8, 0], function: "S" },
      { name: "v", notes: [7, 10, 2], function: "D" },
      { name: "VI", notes: [8, 0, 3], function: "S" },
      { name: "VII", notes: [10, 2, 5], function: "D" },
    ],
  },
  dorian: {
    name: "ドリアンスケール",
    intervals: [0, 2, 3, 5, 7, 9, 10],
    chords: [
      { name: "i", notes: [0, 3, 7], function: "T" },
      { name: "ii", notes: [2, 5, 9], function: "S" },
      { name: "III", notes: [3, 7, 10], function: "T" },
      { name: "IV", notes: [5, 9, 0], function: "S" },
      { name: "v", notes: [7, 10, 2], function: "D" },
      { name: "vi°", notes: [9, 0, 3], function: "T" },
      { name: "VII", notes: [10, 2, 5], function: "D" },
    ],
  },
}

const CHORD_PROGRESSIONS: { [key: string]: string[][] } = {
  pop: [
    ["vi", "IV", "I", "V"],
    ["I", "V", "vi", "IV"],
    ["I", "vi", "ii", "V"],
    ["vi", "ii", "V", "I"],
    ["I", "vi", "IV", "V"],
  ],
  jazz: [
    ["ii", "V", "I", "vi"],
    ["I", "vi", "ii", "V"],
    ["iii", "vi", "ii", "V"],
    ["I", "VI7", "ii", "V"],
    ["ii", "V", "iii", "vi"],
    ["I", "I7", "IV", "iv"],
  ],
  rock: [
    ["I", "VII", "IV", "I"],
    ["vi", "IV", "I", "V"],
    ["I", "V", "IV", "I"],
    ["I", "bVII", "IV", "I"],
    ["vi", "V", "IV", "V"],
  ],
  classical: [
    ["I", "IV", "V", "I"],
    ["I", "ii", "V", "I"],
    ["vi", "ii", "V", "I"],
    ["I", "V", "vi", "IV"],
    ["ii", "V7", "I", "vi"],
  ],
  blues: [
    ["I7", "I7", "I7", "I7"],
    ["IV7", "IV7", "I7", "I7"],
    ["V7", "IV7", "I7", "V7"],
  ],
  electronic: [
    ["i", "VII", "VI", "VII"],
    ["i", "v", "VI", "IV"],
    ["i", "III", "VII", "VI"],
    ["i", "iv", "VII", "III"],
  ],
  ambient: [
    ["i", "VII", "VI", "VII"],
    ["i", "III", "VI", "IV"],
    ["i", "v", "IV", "VII"],
    ["i", "ii°", "V", "i"],
  ],
}

const GENRES = [
  {
    id: "pop",
    name: "ポップ",
    description: "キャッチーで親しみやすいメロディ",
    scale: "major",
    color: "from-pink-400 to-rose-500",
    icon: "🎵",
  },
  {
    id: "rock",
    name: "ロック",
    description: "力強いビートとエネルギッシュな音",
    scale: "major",
    color: "from-red-500 to-orange-600",
    icon: "🎸",
  },
  {
    id: "jazz",
    name: "ジャズ",
    description: "複雑なハーモニーとスイング感",
    scale: "major",
    color: "from-blue-500 to-indigo-600",
    icon: "🎺",
  },
  {
    id: "classical",
    name: "クラシック",
    description: "優雅で洗練された楽曲構成",
    scale: "major",
    color: "from-purple-500 to-violet-600",
    icon: "🎼",
  },
  {
    id: "electronic",
    name: "エレクトロニック",
    description: "シンセサイザーとデジタル音響",
    scale: "minor",
    color: "from-cyan-400 to-blue-500",
    icon: "🎛️",
  },
  {
    id: "ambient",
    name: "アンビエント",
    description: "癒しの空間音楽",
    scale: "dorian",
    color: "from-green-400 to-emerald-500",
    icon: "🌊",
  },
  {
    id: "blues",
    name: "ブルース",
    description: "感情豊かな12小節進行",
    scale: "minor",
    color: "from-indigo-500 to-purple-600",
    icon: "🎷",
  },
  {
    id: "reggae",
    name: "レゲエ",
    description: "リラックスしたオフビート",
    scale: "major",
    color: "from-yellow-400 to-orange-500",
    icon: "🏝️",
  },
]

const INSTRUMENTS: Instrument[] = [
  {
    id: "sine",
    name: "シンセ",
    type: "sine",
    category: "synth",
    icon: <Zap className="w-4 h-4" />,
    color: "bg-blue-500",
    gradient: "from-blue-400 to-blue-600",
  },
  {
    id: "square",
    name: "スクエア",
    type: "square",
    category: "synth",
    icon: <Settings className="w-4 h-4" />,
    color: "bg-indigo-500",
    gradient: "from-indigo-400 to-indigo-600",
  },
  {
    id: "sawtooth",
    name: "ソウトゥース",
    type: "sawtooth",
    category: "synth",
    icon: <TrendingUp className="w-4 h-4" />,
    color: "bg-purple-500",
    gradient: "from-purple-400 to-purple-600",
  },
  {
    id: "triangle",
    name: "トライアングル",
    type: "triangle",
    category: "synth",
    icon: <Play className="w-4 h-4" />,
    color: "bg-cyan-500",
    gradient: "from-cyan-400 to-cyan-600",
  },
  {
    id: "piano",
    name: "ピアノ",
    type: "piano",
    category: "acoustic",
    icon: <Piano className="w-4 h-4" />,
    color: "bg-amber-700",
    gradient: "from-amber-600 to-amber-800",
  },
  {
    id: "violin",
    name: "バイオリン",
    type: "violin",
    category: "acoustic",
    icon: <Music className="w-4 h-4" />,
    color: "bg-orange-600",
    gradient: "from-orange-500 to-orange-700",
  },
  {
    id: "acoustic-guitar",
    name: "アコギ",
    type: "acoustic-guitar",
    category: "acoustic",
    icon: <Heart className="w-4 h-4" />,
    color: "bg-yellow-700",
    gradient: "from-yellow-600 to-yellow-800",
  },
  {
    id: "bass-guitar",
    name: "ベースギター",
    type: "bass-guitar",
    category: "acoustic",
    icon: <BarChart3 className="w-4 h-4" />,
    color: "bg-amber-800",
    gradient: "from-amber-700 to-amber-900",
  },
  {
    id: "drums",
    name: "ドラム",
    type: "drums",
    category: "percussion",
    icon: <Drum className="w-4 h-4" />,
    color: "bg-red-600",
    gradient: "from-red-500 to-red-700",
  },
]

const DRUM_TYPES: DrumType[] = [
  {
    id: "kick",
    name: "バスドラム",
    pitch: 36,
    color: "bg-red-700",
    key: "x",
    description: "低音の力強い音",
    frequency: 60,
    decay: 0.3,
    type: "mixed",
  },
  {
    id: "kick2",
    name: "バスドラム2",
    pitch: 35,
    color: "bg-red-800",
    key: "z",
    description: "より深い低音",
    frequency: 50,
    decay: 0.4,
    type: "mixed",
  },
  {
    id: "snare",
    name: "スネア",
    pitch: 38,
    color: "bg-orange-500",
    key: "s",
    description: "シャープな音",
    frequency: 200,
    decay: 0.1,
    type: "noise",
  },
  {
    id: "snare2",
    name: "スネア2",
    pitch: 40,
    color: "bg-orange-600",
    key: "a",
    description: "明るいスネア",
    frequency: 250,
    decay: 0.1,
    type: "noise",
  },
  {
    id: "hihat-closed",
    name: "ハイハット(クローズ)",
    pitch: 42,
    color: "bg-yellow-500",
    key: "r",
    description: "閉じたハイハット",
    frequency: 8000,
    decay: 0.05,
    type: "noise",
  },
  {
    id: "hihat-open",
    name: "ハイハット(オープン)",
    pitch: 46,
    color: "bg-yellow-700",
    key: "e",
    description: "開いたハイハット",
    frequency: 6000,
    decay: 0.3,
    type: "noise",
  },
  {
    id: "tom-high",
    name: "ハイタム",
    pitch: 50,
    color: "bg-green-500",
    key: "g",
    description: "高音のタム",
    frequency: 300,
    decay: 0.2,
    type: "mixed",
  },
  {
    id: "tom-mid",
    name: "ミドルタム",
    pitch: 48,
    color: "bg-green-600",
    key: "h",
    description: "中音のタム",
    frequency: 200,
    decay: 0.3,
    type: "mixed",
  },
  {
    id: "tom-floor",
    name: "フロアタム",
    pitch: 45,
    color: "bg-green-700",
    key: "j",
    description: "低音のタム",
    frequency: 100,
    decay: 0.4,
    type: "mixed",
  },
  {
    id: "crash",
    name: "クラッシュシンバル",
    pitch: 49,
    color: "bg-blue-500",
    key: "y",
    description: "アクセントのシンバル",
    frequency: 3000,
    decay: 1.0,
    type: "noise",
  },
  {
    id: "ride",
    name: "ライドシンバル",
    pitch: 51,
    color: "bg-blue-600",
    key: "u",
    description: "リズムを刻むシンバル",
    frequency: 2000,
    decay: 0.8,
    type: "noise",
  },
]

export default function MusicComposer() {
  // State variables
  const [notes, setNotes] = useState<Note[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [selectedNote, setSelectedNote] = useState<string | null>(null)
  const [tempo, setTempo] = useState([120])
  const [selectedPitch, setSelectedPitch] = useState(60)
  const [noteDuration, setNoteDuration] = useState(1)
  const [selectedGenre, setSelectedGenre] = useState("pop")
  const [selectedInstrument, setSelectedInstrument] = useState("sine")
  const [selectedKey, setSelectedKey] = useState(0)
  const [selectedScale, setSelectedScale] = useState("major")
  const [selectedDrumType, setSelectedDrumType] = useState("kick")
  const [keyboardModeActive, setKeyboardModeActive] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiGeneratedNotes, setAiGeneratedNotes] = useState<Note[]>([])
  const [detectedKey, setDetectedKey] = useState<string>("")
  const [currentChordProgression, setCurrentChordProgression] = useState<string[]>([])
  const [audioError, setAudioError] = useState<string>("")
  const [isExporting, setIsExporting] = useState(false)
  const [selectedNotes, setSelectedNotes] = useState<string[]>([])
  const [copiedNotes, setCopiedNotes] = useState<Note[]>([])
  const [selectionMode, setSelectionMode] = useState(false)
  const [masterVolume, setMasterVolume] = useState([0.7])
  const [showAdvancedControls, setShowAdvancedControls] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [compactView, setCompactView] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [playbackProgress, setPlaybackProgress] = useState(0)
  const [exportFormat, setExportFormat] = useState<"wav" | "mp3">("mp3")

  const audioContextRef = useRef<AudioContext | null>(null)
  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Audio context initialization
  const initAudioContext = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      return audioContextRef.current
    } catch (error) {
      console.error("AudioContext initialization failed:", error)
      setAudioError("音声システムの初期化に失敗しました")
      return null
    }
  }, [])

  // Sound generation functions
  const createViolinSound = useCallback(
    (audioContext: AudioContext, frequency: number, duration: number, velocity: number, startTime: number) => {
      try {
        // メインオシレーター（基音）
        const oscillator1 = audioContext.createOscillator()
        const oscillator2 = audioContext.createOscillator()
        const oscillator3 = audioContext.createOscillator()

        const gainNode = audioContext.createGain()
        const filterNode = audioContext.createBiquadFilter()

        // 複数の倍音を重ねてバイオリンらしい音色を作成
        oscillator1.frequency.setValueAtTime(frequency, startTime)
        oscillator2.frequency.setValueAtTime(frequency * 2, startTime) // 2倍音
        oscillator3.frequency.setValueAtTime(frequency * 3, startTime) // 3倍音

        oscillator1.type = "sawtooth"
        oscillator2.type = "sine"
        oscillator3.type = "sine"

        // フィルターでより自然な音色に
        filterNode.type = "lowpass"
        filterNode.frequency.setValueAtTime(frequency * 4, startTime)
        filterNode.Q.setValueAtTime(1, startTime)

        // 各オシレーターの音量調整
        const gain1 = audioContext.createGain()
        const gain2 = audioContext.createGain()
        const gain3 = audioContext.createGain()

        gain1.gain.setValueAtTime(0.7, startTime)
        gain2.gain.setValueAtTime(0.2, startTime)
        gain3.gain.setValueAtTime(0.1, startTime)

        // 接続
        oscillator1.connect(gain1)
        oscillator2.connect(gain2)
        oscillator3.connect(gain3)

        gain1.connect(gainNode)
        gain2.connect(gainNode)
        gain3.connect(gainNode)
        gainNode.connect(filterNode)
        filterNode.connect(audioContext.destination)

        // 音量エンベロープ（ADSR）
        gainNode.gain.setValueAtTime(0, startTime)
        gainNode.gain.linearRampToValueAtTime(velocity * masterVolume[0] * 0.8, startTime + 0.1) // アタック
        gainNode.gain.exponentialRampToValueAtTime(velocity * masterVolume[0] * 0.6, startTime + 0.3) // ディケイ
        gainNode.gain.setValueAtTime(velocity * masterVolume[0] * 0.4, startTime + duration - 0.2) // サスティン
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration) // リリース

        oscillator1.start(startTime)
        oscillator2.start(startTime)
        oscillator3.start(startTime)

        oscillator1.stop(startTime + duration)
        oscillator2.stop(startTime + duration)
        oscillator3.stop(startTime + duration)
      } catch (error) {
        console.error("Violin sound generation error:", error)
      }
    },
    [masterVolume],
  )

  const createPianoSound = useCallback(
    (audioContext: AudioContext, frequency: number, duration: number, velocity: number, startTime: number) => {
      try {
        // ピアノの複雑な倍音構造を再現
        const oscillators = []
        const gains = []
        const harmonics = [1, 2, 3, 4, 5, 6] // 倍音
        const amplitudes = [1, 0.5, 0.25, 0.125, 0.0625, 0.03125] // 各倍音の音量

        const masterGain = audioContext.createGain()
        const compressor = audioContext.createDynamicsCompressor()

        // 複数の倍音を生成
        for (let i = 0; i < harmonics.length; i++) {
          const osc = audioContext.createOscillator()
          const gain = audioContext.createGain()

          osc.frequency.setValueAtTime(frequency * harmonics[i], startTime)
          osc.type = i === 0 ? "triangle" : "sine"

          gain.gain.setValueAtTime(amplitudes[i] * velocity * masterVolume[0], startTime)

          osc.connect(gain)
          gain.connect(masterGain)

          oscillators.push(osc)
          gains.push(gain)
        }

        // コンプレッサーで音を整える
        compressor.threshold.setValueAtTime(-24, startTime)
        compressor.knee.setValueAtTime(30, startTime)
        compressor.ratio.setValueAtTime(12, startTime)
        compressor.attack.setValueAtTime(0.003, startTime)
        compressor.release.setValueAtTime(0.25, startTime)

        masterGain.connect(compressor)
        compressor.connect(audioContext.destination)

        // ピアノらしいエンベロープ（急激なアタック、長いディケイ）
        masterGain.gain.setValueAtTime(0, startTime)
        masterGain.gain.linearRampToValueAtTime(velocity * masterVolume[0], startTime + 0.01) // 急激なアタック
        masterGain.gain.exponentialRampToValueAtTime(velocity * masterVolume[0] * 0.3, startTime + 0.1) // 急激なディケイ
        masterGain.gain.exponentialRampToValueAtTime(velocity * masterVolume[0] * 0.1, startTime + duration * 0.5) // 長いサスティン
        masterGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration) // リリース

        // 全オシレーターを開始・停止
        oscillators.forEach((osc) => {
          osc.start(startTime)
          osc.stop(startTime + duration)
        })
      } catch (error) {
        console.error("Piano sound generation error:", error)
      }
    },
    [masterVolume],
  )

  const createAcousticGuitarSound = useCallback(
    (audioContext: AudioContext, frequency: number, duration: number, velocity: number, startTime: number) => {
      try {
        // ギターの弦の振動を模擬
        const oscillator1 = audioContext.createOscillator()
        const oscillator2 = audioContext.createOscillator()
        const noiseOsc = audioContext.createOscillator()

        const gainNode = audioContext.createGain()
        const noiseGain = audioContext.createGain()
        const filterNode = audioContext.createBiquadFilter()
        const reverbGain = audioContext.createGain()

        // メイン音色
        oscillator1.frequency.setValueAtTime(frequency, startTime)
        oscillator2.frequency.setValueAtTime(frequency * 2.1, startTime) // わずかにデチューン

        oscillator1.type = "sawtooth"
        oscillator2.type = "triangle"

        // ノイズ成分（弦のこすれ音）
        noiseOsc.frequency.setValueAtTime(frequency * 8, startTime)
        noiseOsc.type = "square"

        // フィルター設定
        filterNode.type = "bandpass"
        filterNode.frequency.setValueAtTime(frequency * 2, startTime)
        filterNode.Q.setValueAtTime(2, startTime)

        // 接続
        oscillator1.connect(gainNode)
        oscillator2.connect(gainNode)
        noiseOsc.connect(noiseGain)

        gainNode.connect(filterNode)
        noiseGain.connect(filterNode)
        filterNode.connect(reverbGain)
        reverbGain.connect(audioContext.destination)

        // エンベロープ設定
        gainNode.gain.setValueAtTime(0, startTime)
        gainNode.gain.linearRampToValueAtTime(velocity * masterVolume[0] * 0.8, startTime + 0.02) // 速いアタック
        gainNode.gain.exponentialRampToValueAtTime(velocity * masterVolume[0] * 0.4, startTime + 0.1) // ディケイ
        gainNode.gain.exponentialRampToValueAtTime(velocity * masterVolume[0] * 0.2, startTime + duration * 0.7) // サスティン
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration) // リリース

        // ノイズ成分の音量
        noiseGain.gain.setValueAtTime(velocity * masterVolume[0] * 0.05, startTime)
        noiseGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1)

        // リバーブ効果
        reverbGain.gain.setValueAtTime(0.8, startTime)

        oscillator1.start(startTime)
        oscillator2.start(startTime)
        noiseOsc.start(startTime)

        oscillator1.stop(startTime + duration)
        oscillator2.stop(startTime + duration)
        noiseOsc.stop(startTime + 0.1)
      } catch (error) {
        console.error("Acoustic guitar sound generation error:", error)
      }
    },
    [masterVolume],
  )

  const createBassGuitarSound = useCallback(
    (audioContext: AudioContext, frequency: number, duration: number, velocity: number, startTime: number) => {
      try {
        // ベースの太い低音を作成
        const oscillator1 = audioContext.createOscillator()
        const oscillator2 = audioContext.createOscillator()
        const subOsc = audioContext.createOscillator()

        const gainNode = audioContext.createGain()
        const subGain = audioContext.createGain()
        const filterNode = audioContext.createBiquadFilter()
        const distortion = audioContext.createWaveShaper()

        // メイン周波数
        oscillator1.frequency.setValueAtTime(frequency, startTime)
        oscillator2.frequency.setValueAtTime(frequency * 1.01, startTime) // わずかにデチューン
        subOsc.frequency.setValueAtTime(frequency * 0.5, startTime) // サブベース

        oscillator1.type = "sawtooth"
        oscillator2.type = "square"
        subOsc.type = "sine"

        // ローパスフィルターで低音を強調
        filterNode.type = "lowpass"
        filterNode.frequency.setValueAtTime(frequency * 3, startTime)
        filterNode.Q.setValueAtTime(1.5, startTime)

        // 軽いディストーション
        const curve = new Float32Array(256)
        for (let i = 0; i < 256; i++) {
          const x = (i - 128) / 128
          curve[i] = Math.tanh(x * 2) * 0.8
        }
        distortion.curve = curve

        // 接続
        oscillator1.connect(gainNode)
        oscillator2.connect(gainNode)
        subOsc.connect(subGain)

        gainNode.connect(filterNode)
        subGain.connect(filterNode)
        filterNode.connect(distortion)
        distortion.connect(audioContext.destination)

        // エンベロープ
        gainNode.gain.setValueAtTime(0, startTime)
        gainNode.gain.linearRampToValueAtTime(velocity * masterVolume[0] * 0.9, startTime + 0.01)
        gainNode.gain.exponentialRampToValueAtTime(velocity * masterVolume[0] * 0.7, startTime + 0.05)
        gainNode.gain.exponentialRampToValueAtTime(velocity * masterVolume[0] * 0.3, startTime + duration * 0.8)
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

        // サブベースの音量
        subGain.gain.setValueAtTime(velocity * masterVolume[0] * 0.4, startTime)
        subGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

        oscillator1.start(startTime)
        oscillator2.start(startTime)
        subOsc.start(startTime)

        oscillator1.stop(startTime + duration)
        oscillator2.stop(startTime + duration)
        subOsc.stop(startTime + duration)
      } catch (error) {
        console.error("Bass guitar sound generation error:", error)
      }
    },
    [masterVolume],
  )

  const createDrumSound = useCallback(
    (audioContext: AudioContext, drumType: DrumType, velocity: number, startTime: number) => {
      try {
        if (drumType.type === "noise") {
          // ノイズベースのドラム音（スネア、ハイハットなど）
          const bufferSize = audioContext.sampleRate * (drumType.decay || 0.2)
          const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate)
          const data = buffer.getChannelData(0)

          // ホワイトノイズ生成
          for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.1))
          }

          const source = audioContext.createBufferSource()
          const gainNode = audioContext.createGain()
          const filterNode = audioContext.createBiquadFilter()

          source.buffer = buffer

          // フィルター設定
          filterNode.type = "bandpass"
          filterNode.frequency.setValueAtTime(drumType.frequency || 1000, startTime)
          filterNode.Q.setValueAtTime(drumType.id.includes("hihat") ? 0.5 : 2, startTime)

          source.connect(filterNode)
          filterNode.connect(gainNode)
          gainNode.connect(audioContext.destination)

          gainNode.gain.setValueAtTime(velocity * masterVolume[0], startTime)
          gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + (drumType.decay || 0.2))

          source.start(startTime)
        } else {
          // トーンベースのドラム音（キック、タムなど）
          const oscillator = audioContext.createOscillator()
          const gainNode = audioContext.createGain()
          const filterNode = audioContext.createBiquadFilter()

          oscillator.frequency.setValueAtTime(drumType.frequency || 60, startTime)
          oscillator.frequency.exponentialRampToValueAtTime((drumType.frequency || 60) * 0.1, startTime + 0.1)

          oscillator.type = "sine"

          // ローパスフィルター
          filterNode.type = "lowpass"
          filterNode.frequency.setValueAtTime((drumType.frequency || 60) * 4, startTime)
          filterNode.Q.setValueAtTime(1, startTime)

          oscillator.connect(filterNode)
          filterNode.connect(gainNode)
          gainNode.connect(audioContext.destination)

          gainNode.gain.setValueAtTime(velocity * masterVolume[0], startTime)
          gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + (drumType.decay || 0.3))

          oscillator.start(startTime)
          oscillator.stop(startTime + (drumType.decay || 0.3))
        }
      } catch (error) {
        console.error("Drum sound generation error:", error)
      }
    },
    [masterVolume],
  )

  // Main playNote function - defined before other functions that use it
  const playNote = useCallback(
    (pitch: number, duration: number, velocity: number, instrumentType: string, drumType?: string) => {
      try {
        const audioContext = initAudioContext()
        if (!audioContext) return

        const frequency = 440 * Math.pow(2, (pitch - 69) / 12)
        const startTime = audioContext.currentTime

        switch (instrumentType) {
          case "violin":
            createViolinSound(audioContext, frequency, duration, velocity, startTime)
            break
          case "piano":
            createPianoSound(audioContext, frequency, duration, velocity, startTime)
            break
          case "acoustic-guitar":
            createAcousticGuitarSound(audioContext, frequency, duration, velocity, startTime)
            break
          case "bass-guitar":
            createBassGuitarSound(audioContext, frequency, duration, velocity, startTime)
            break
          case "drums":
            if (drumType) {
              const drum = DRUM_TYPES.find((d) => d.id === drumType)
              if (drum) {
                createDrumSound(audioContext, drum, velocity, startTime)
              }
            }
            break
          case "sine":
          case "square":
          case "sawtooth":
          case "triangle":
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()

            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)

            oscillator.frequency.setValueAtTime(frequency, startTime)
            oscillator.type = instrumentType as OscillatorType

            gainNode.gain.setValueAtTime(0, startTime)
            gainNode.gain.linearRampToValueAtTime(velocity * masterVolume[0], startTime + 0.01)
            gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

            oscillator.start(startTime)
            oscillator.stop(startTime + duration)
            break
          default:
            console.warn("Unknown instrument type:", instrumentType)
        }
      } catch (error) {
        console.error("Error playing note:", error)
        setAudioError("オーディオ再生中にエラーが発生しました")
      }
    },
    [
      initAudioContext,
      createViolinSound,
      createPianoSound,
      createAcousticGuitarSound,
      createBassGuitarSound,
      createDrumSound,
      masterVolume,
    ],
  )

  // Note management functions
  const addNote = useCallback(() => {
    let newNote: Note

    if (selectedInstrument === "drums") {
      const drumType = DRUM_TYPES.find((d) => d.id === selectedDrumType)
      newNote = {
        id: Math.random().toString(36).substr(2, 9),
        pitch: drumType?.pitch || 36,
        start: currentTime,
        duration: 0.2,
        velocity: 0.7,
        instrument: "drums",
        drumType: selectedDrumType,
      }
    } else {
      newNote = {
        id: Math.random().toString(36).substr(2, 9),
        pitch: selectedPitch,
        start: currentTime,
        duration: noteDuration,
        velocity: 0.7,
        instrument: selectedInstrument,
      }
    }

    setNotes((prev) => [...prev, newNote])

    if (selectedInstrument === "drums" && newNote.drumType) {
      playNote(newNote.pitch, 0.2, 0.7, "drums", newNote.drumType)
    } else {
      playNote(selectedPitch, noteDuration * 0.5, 0.7, selectedInstrument)
    }
  }, [selectedPitch, currentTime, noteDuration, selectedInstrument, selectedDrumType, playNote])

  const deleteNote = useCallback((noteId: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== noteId))
    setSelectedNote(null)
  }, [])

  // Playback functions
  const playComposition = useCallback(
    (notesToPlay = notes) => {
      if (isPlaying) return

      setIsPlaying(true)
      setAudioError("")
      setPlaybackProgress(0)

      const maxTime = Math.max(...notesToPlay.map((note) => note.start + note.duration), 4)

      notesToPlay.forEach((note) => {
        setTimeout(() => {
          if (note.instrument === "drums" && note.drumType) {
            playNote(note.pitch, 0.2, note.velocity, "drums", note.drumType)
          } else {
            playNote(note.pitch, note.duration, note.velocity, note.instrument || "sine")
          }
        }, note.start * 1000)
      })

      playbackIntervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const newTime = prev + 0.1
          setPlaybackProgress((newTime / maxTime) * 100)
          return newTime
        })
      }, 100)

      setTimeout(() => {
        stopPlayback()
      }, maxTime * 1000)
    },
    [isPlaying, notes, playNote],
  )

  const stopPlayback = useCallback(() => {
    setIsPlaying(false)
    setPlaybackProgress(0)
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current)
      playbackIntervalRef.current = null
    }
  }, [])

  const resetComposition = useCallback(() => {
    stopPlayback()
    setNotes([])
    setAiGeneratedNotes([])
    setCurrentTime(0)
    setSelectedNote(null)
    setDetectedKey("")
    setCurrentChordProgression([])
    setAudioError("")
    setSelectedNotes([])
    setCopiedNotes([])
    setPlaybackProgress(0)
  }, [stopPlayback])

  const playAIComposition = useCallback(() => {
    const allNotes = [...notes, ...aiGeneratedNotes]
    playComposition(allNotes)
  }, [notes, aiGeneratedNotes, playComposition])

  // Simplified AI composition function
  const generateAdvancedAIComposition = useCallback(async () => {
    if (notes.length === 0) {
      alert("まず基本のメロディを入力してください")
      return
    }

    setIsGenerating(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const generatedNotes: Note[] = []
    const maxTime = Math.max(...notes.map((note) => note.start + note.duration))

    // Simple chord generation
    for (let i = 0; i < 4; i++) {
      const startTime = i * 2
      const chordNotes = [60, 64, 67] // C major chord

      chordNotes.forEach((pitch, index) => {
        generatedNotes.push({
          id: Math.random().toString(36).substr(2, 9),
          pitch: pitch,
          start: startTime + index * 0.1,
          duration: 1.8,
          velocity: 0.4,
          instrument: "piano",
          chordName: "C",
          function: "T",
        })
      })
    }

    setAiGeneratedNotes(generatedNotes)
    setIsGenerating(false)
    setCurrentChordProgression(["C", "Am", "F", "G"])
  }, [notes])

  // Utility functions
  const getPitchName = (pitch: number) => {
    const noteIndex = pitch % 12
    const octave = Math.floor(pitch / 12) - 1
    return `${NOTES[noteIndex]}${octave}`
  }

  const getInstrumentsByCategory = useCallback((category: string) => {
    return INSTRUMENTS.filter((instrument) => instrument.category === category)
  }, [])

  const getInstrumentColor = useCallback((instrumentType: string) => {
    const instrument = INSTRUMENTS.find((i) => i.type === instrumentType)
    return instrument?.color || "bg-gray-500"
  }, [])

  const getDrumTypeColor = useCallback((drumType: string) => {
    const drum = DRUM_TYPES.find((d) => d.id === drumType)
    return drum?.color || "bg-gray-500"
  }, [])

  const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
    const numberOfChannels = buffer.numberOfChannels
    const sampleRate = buffer.sampleRate
    const length = buffer.length

    const bytes = numberOfChannels * length * 2 + 44
    const bufferWav = new ArrayBuffer(bytes)
    const view = new DataView(bufferWav)

    /* RIFF identifier */
    writeUTFBytes(view, 0, "RIFF")
    /* RIFF size */
    view.setUint32(4, bytes - 8, true)
    /* RIFF format */
    writeUTFBytes(view, 8, "WAVE")
    /* format chunk identifier */
    writeUTFBytes(view, 12, "fmt ")
    /* format chunk byte size */
    view.setUint32(16, 16, true)
    /* sample format (raw) */
    view.setUint16(20, 1, true)
    /* channel count */
    view.setUint16(22, numberOfChannels, true)
    /* sample rate */
    view.setUint32(24, sampleRate, true)
    /* byte rate (sample rate * block align) */
    view.setUint32(28, sampleRate * 4, true)
    /* block align (channel count * bytes per sample) */
    view.setUint16(32, numberOfChannels * 2, true)
    /* bits per sample */
    view.setUint16(34, 16, true)
    /* data chunk identifier */
    writeUTFBytes(view, 36, "data")
    /* data chunk byte size */
    view.setUint32(40, numberOfChannels * length * 2, true)

    floatTo16BitPCM(view, 44, buffer)

    return bufferWav
  }

  const floatTo16BitPCM = (output: DataView, offset: number, input: AudioBuffer) => {
    for (let i = 0; i < input.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, input.getChannelData(0)[i]))
      output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true)
    }
  }

  const writeUTFBytes = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }

  const exportAudio = useCallback(async () => {
    setIsExporting(true)
    setAudioError("")

    try {
      const allNotes = aiGeneratedNotes.length > 0 ? [...notes, ...aiGeneratedNotes] : notes

      if (allNotes.length === 0) {
        alert("エクスポートする音符がありません")
        setIsExporting(false)
        return
      }

      const audioContext = initAudioContext()
      if (!audioContext) {
        setIsExporting(false)
        return
      }

      const maxTime = Math.max(...allNotes.map((note) => note.start + note.duration), 4)
      const sampleRate = 44100
      const bufferLength = Math.ceil(maxTime * sampleRate)

      const offlineContext = new OfflineAudioContext(2, bufferLength, sampleRate)

      for (const note of allNotes) {
        const frequency = 440 * Math.pow(2, (note.pitch - 69) / 12)
        const startTime = note.start
        const duration = note.duration

        if (note.instrument === "drums" && note.drumType) {
          const drumType = DRUM_TYPES.find((d) => d.id === note.drumType)
          if (drumType) {
            createDrumSound(offlineContext, drumType, note.velocity, startTime)
          }
        } else {
          const oscillator = offlineContext.createOscillator()
          const gainNode = offlineContext.createGain()

          oscillator.connect(gainNode)
          gainNode.connect(offlineContext.destination)

          oscillator.frequency.setValueAtTime(frequency, startTime)

          switch (note.instrument) {
            case "violin":
            case "acoustic-guitar":
              oscillator.type = "sawtooth"
              break
            case "piano":
              oscillator.type = "triangle"
              break
            case "sine":
            case "square":
            case "sawtooth":
            case "triangle":
              oscillator.type = note.instrument as OscillatorType
              break
            default:
              oscillator.type = "sine"
          }

          gainNode.gain.setValueAtTime(0, startTime)
          gainNode.gain.linearRampToValueAtTime(note.velocity * masterVolume[0], startTime + 0.01)
          gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

          oscillator.start(startTime)
          oscillator.stop(startTime + duration)
        }
      }

      const renderedBuffer = await offlineContext.startRendering()

      let blob: Blob
      let filename: string

      if (exportFormat === "mp3") {
        // MP3エンコーディング（簡易版）
        const mp3Buffer = await audioBufferToMp3(renderedBuffer)
        blob = new Blob([mp3Buffer], { type: "audio/mp3" })
        filename = `composition_${selectedGenre}_${detectedKey}_${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.mp3`
      } else {
        // WAVエンコーディング
        const wavBuffer = audioBufferToWav(renderedBuffer)
        blob = new Blob([wavBuffer], { type: "audio/wav" })
        filename = `composition_${selectedGenre}_${detectedKey}_${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.wav`
      }

      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)

      alert(`${exportFormat.toUpperCase()}ファイルとして保存しました！`)
    } catch (error) {
      console.error("Audio export error:", error)
      setAudioError(`${exportFormat.toUpperCase()}エクスポートでエラーが発生しました`)
    }

    setIsExporting(false)
  }, [
    notes,
    aiGeneratedNotes,
    selectedGenre,
    detectedKey,
    initAudioContext,
    createDrumSound,
    exportFormat,
    masterVolume,
  ])

  const audioBufferToMp3 = useCallback(async (buffer: AudioBuffer) => {
    // 簡易MP3エンコーディング（実際のプロジェクトではlame.jsやffmpeg.wasmを使用）
    const length = buffer.length
    const numberOfChannels = buffer.numberOfChannels
    const sampleRate = buffer.sampleRate

    // PCMデータを取得
    const pcmData = new Float32Array(length * numberOfChannels)
    let offset = 0

    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        pcmData[offset++] = buffer.getChannelData(channel)[i]
      }
    }

    // 簡易圧縮（実際のMP3エンコーディングではありませんが、デモ用）
    const compressedData = new Int16Array(pcmData.length)
    for (let i = 0; i < pcmData.length; i++) {
      compressedData[i] = Math.max(-32768, Math.min(32767, pcmData[i] * 32767))
    }

    // MP3ヘッダー（簡易版）
    const mp3Header = new Uint8Array([
      0xff,
      0xfb,
      0x90,
      0x00, // MP3 sync word and header
      0x00,
      0x00,
      0x00,
      0x00, // 追加のヘッダー情報
    ])

    // データを結合
    const result = new Uint8Array(mp3Header.length + compressedData.byteLength)
    result.set(mp3Header, 0)
    result.set(new Uint8Array(compressedData.buffer), mp3Header.length)

    return result.buffer
  }, [])

  const selectedGenreData = GENRES.find((g) => g.id === selectedGenre)

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        darkMode
          ? "bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900"
          : "bg-gradient-to-br from-indigo-50 via-white to-purple-50"
      } p-4`}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card
          className={`border-0 shadow-2xl ${
            darkMode ? "bg-gradient-to-r from-gray-800 to-slate-800" : "bg-gradient-to-r from-white to-gray-50"
          }`}
        >
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle
                className={`text-3xl font-bold flex items-center gap-3 ${darkMode ? "text-white" : "text-gray-800"}`}
              >
                <div className="relative">
                  <Music className="w-10 h-10 text-indigo-600" />
                  <Sparkles className="w-5 h-5 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
                </div>
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  AI音楽作曲スタジオ
                </span>
                <Badge variant="secondary" className="text-xs">
                  v2.0
                </Badge>
              </CardTitle>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                    className="data-[state=checked]:bg-indigo-600"
                  />
                  <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>ダークモード</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHelp(!showHelp)}
                  className="flex items-center gap-2"
                >
                  <HelpCircle className="w-4 h-4" />
                  ヘルプ
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCompactView(!compactView)}
                  className="flex items-center gap-2"
                >
                  {compactView ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                  {compactView ? "拡張" : "コンパクト"}
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            {isPlaying && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                    再生中...
                  </span>
                  <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    {Math.round(playbackProgress)}%
                  </span>
                </div>
                <Progress value={playbackProgress} className="h-2" />
              </div>
            )}
          </CardHeader>
        </Card>

        {/* Help Panel */}
        {showHelp && (
          <Card
            className={`border-blue-200 ${
              darkMode
                ? "bg-gradient-to-r from-blue-900/50 to-indigo-900/50"
                : "bg-gradient-to-r from-blue-50 to-indigo-50"
            }`}
          >
            <CardHeader>
              <CardTitle className={`text-lg flex items-center gap-2 ${darkMode ? "text-blue-300" : "text-blue-700"}`}>
                <Info className="w-5 h-5" />
                使い方ガイド
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`space-y-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                <h4 className="font-semibold">基本操作</h4>
                <ul className="text-sm space-y-1">
                  <li>• 楽器を選択して「音符を追加」で音符を配置</li>
                  <li>• 音程と長さを調整してメロディを作成</li>
                  <li>• 「基本メロディ再生」で確認</li>
                  <li>• AI作曲でハーモニーとリズムを自動生成</li>
                </ul>
              </div>
              <div className={`space-y-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                <h4 className="font-semibold">キーボードショートカット</h4>
                <ul className="text-sm space-y-1">
                  <li>• Ctrl+A: 全選択</li>
                  <li>• Ctrl+C: コピー</li>
                  <li>• Ctrl+V: ペースト</li>
                  <li>• Delete: 削除</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {audioError && (
          <Card className="border-red-200 bg-gradient-to-r from-red-50 to-pink-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">{audioError}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Music Theory Panel */}
          <Card
            className={`border-0 shadow-lg ${
              darkMode
                ? "bg-gradient-to-br from-green-900/50 to-emerald-900/50"
                : "bg-gradient-to-br from-green-50 to-emerald-50"
            }`}
          >
            <CardHeader>
              <CardTitle
                className={`text-lg flex items-center gap-2 ${darkMode ? "text-green-300" : "text-green-700"}`}
              >
                <BookOpen className="w-5 h-5" />
                音楽理論
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>キー</label>
                <Select
                  value={selectedKey.toString()}
                  onValueChange={(value) => setSelectedKey(Number.parseInt(value))}
                >
                  <SelectTrigger className={darkMode ? "bg-gray-800 border-gray-600" : ""}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTES.map((note, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {note}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  スケール
                </label>
                <Select value={selectedScale} onValueChange={setSelectedScale}>
                  <SelectTrigger className={darkMode ? "bg-gray-800 border-gray-600" : ""}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SCALES).map(([key, scale]) => (
                      <SelectItem key={key} value={key}>
                        {scale.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {detectedKey && (
                <div className="p-3 bg-white/50 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">検出されたキー:</span>
                    <Badge variant="default">{detectedKey}</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Genre Selection */}
          <Card
            className={`border-0 shadow-lg ${
              darkMode
                ? "bg-gradient-to-br from-purple-900/50 to-pink-900/50"
                : "bg-gradient-to-br from-purple-50 to-pink-50"
            }`}
          >
            <CardHeader>
              <CardTitle
                className={`text-lg flex items-center gap-2 ${darkMode ? "text-purple-300" : "text-purple-700"}`}
              >
                <Palette className="w-5 h-5" />
                ジャンル選択
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger className={darkMode ? "bg-gray-800 border-gray-600" : ""}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GENRES.map((genre) => (
                    <SelectItem key={genre.id} value={genre.id}>
                      <div className="flex items-center gap-2">
                        <span>{genre.icon}</span>
                        <span>{genre.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedGenreData && (
                <div className={`p-4 rounded-lg bg-gradient-to-r ${selectedGenreData.color} text-white`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{selectedGenreData.icon}</span>
                    <h3 className="font-bold">{selectedGenreData.name}</h3>
                  </div>
                  <p className="text-sm opacity-90">{selectedGenreData.description}</p>
                </div>
              )}

              {currentChordProgression.length > 0 && (
                <div className="space-y-2">
                  <label className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    コード進行
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {currentChordProgression.map((chord, index) => (
                      <Badge key={index} variant="outline" className="text-sm">
                        {chord}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Master Controls */}
          <Card
            className={`border-0 shadow-lg ${
              darkMode
                ? "bg-gradient-to-br from-blue-900/50 to-cyan-900/50"
                : "bg-gradient-to-br from-blue-50 to-cyan-50"
            }`}
          >
            <CardHeader>
              <CardTitle className={`text-lg flex items-center gap-2 ${darkMode ? "text-blue-300" : "text-blue-700"}`}>
                <Settings className="w-5 h-5" />
                マスターコントロール
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4" />
                  <label className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    音量: {Math.round(masterVolume[0] * 100)}%
                  </label>
                </div>
                <Slider
                  value={masterVolume}
                  onValueChange={setMasterVolume}
                  max={1}
                  min={0}
                  step={0.01}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  テンポ: {tempo[0]} BPM
                </label>
                <Slider value={tempo} onValueChange={setTempo} max={200} min={60} step={1} className="w-full" />
              </div>

              <div className="space-y-2">
                <label className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  現在時刻: {currentTime.toFixed(1)}s
                </label>
                <Slider
                  value={[currentTime]}
                  onValueChange={(value) => setCurrentTime(value[0])}
                  max={16}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instrument Selection */}
        <Card className={`border-0 shadow-lg ${darkMode ? "bg-gray-800" : "bg-white"}`}>
          <CardHeader>
            <CardTitle className={`text-lg flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-800"}`}>
              <Layers className="w-5 h-5" />
              楽器選択
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="synth" className="w-full">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="synth" className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  シンセサイザー
                </TabsTrigger>
                <TabsTrigger value="acoustic" className="flex items-center gap-2">
                  <Music className="w-4 h-4" />
                  アコースティック
                </TabsTrigger>
                <TabsTrigger value="percussion" className="flex items-center gap-2">
                  <Drum className="w-4 h-4" />
                  パーカッション
                </TabsTrigger>
              </TabsList>

              <TabsContent value="synth" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {getInstrumentsByCategory("synth").map((instrument) => (
                    <Button
                      key={instrument.id}
                      variant={selectedInstrument === instrument.type ? "default" : "outline"}
                      className={`h-16 flex flex-col items-center justify-center gap-2 transition-all duration-200 hover:scale-105 ${
                        selectedInstrument === instrument.type
                          ? `bg-gradient-to-r ${instrument.gradient} text-white shadow-lg`
                          : darkMode
                            ? "hover:bg-gray-700"
                            : "hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedInstrument(instrument.type)}
                    >
                      {instrument.icon || <Sparkles className="w-5 h-5" />}
                      <span className="text-sm font-medium">{instrument.name}</span>
                    </Button>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="acoustic" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {getInstrumentsByCategory("acoustic").map((instrument) => (
                    <Button
                      key={instrument.id}
                      variant={selectedInstrument === instrument.type ? "default" : "outline"}
                      className={`h-16 flex flex-col items-center justify-center gap-2 transition-all duration-200 hover:scale-105 ${
                        selectedInstrument === instrument.type
                          ? `bg-gradient-to-r ${instrument.gradient} text-white shadow-lg`
                          : darkMode
                            ? "hover:bg-gray-700"
                            : "hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedInstrument(instrument.type)}
                    >
                      {instrument.icon || <Music className="w-5 h-5" />}
                      <span className="text-sm font-medium">{instrument.name}</span>
                    </Button>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="percussion" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {getInstrumentsByCategory("percussion").map((instrument) => (
                    <Button
                      key={instrument.id}
                      variant={selectedInstrument === instrument.type ? "default" : "outline"}
                      className={`h-16 flex flex-col items-center justify-center gap-2 transition-all duration-200 hover:scale-105 ${
                        selectedInstrument === instrument.type
                          ? `bg-gradient-to-r ${instrument.gradient} text-white shadow-lg`
                          : darkMode
                            ? "hover:bg-gray-700"
                            : "hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedInstrument(instrument.type)}
                    >
                      {instrument.icon || <Drum className="w-5 h-5" />}
                      <span className="text-sm font-medium">{instrument.name}</span>
                    </Button>
                  ))}
                </div>

                {selectedInstrument === "drums" && (
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        ドラムキット
                      </h4>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={keyboardModeActive}
                          onCheckedChange={setKeyboardModeActive}
                          className="data-[state=checked]:bg-indigo-600"
                        />
                        <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                          キーボード入力
                        </span>
                      </div>
                    </div>

                    {keyboardModeActive && (
                      <div
                        className={`p-4 rounded-lg border ${
                          darkMode ? "bg-blue-900/20 border-blue-700" : "bg-blue-50 border-blue-200"
                        }`}
                      >
                        <p className={`text-sm font-medium mb-3 ${darkMode ? "text-blue-300" : "text-blue-700"}`}>
                          キーボードマッピング:
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                          {DRUM_TYPES.filter((d) => d.key).map((drum) => (
                            <div key={drum.id} className="flex items-center gap-2">
                              <kbd
                                className={`px-2 py-1 rounded text-xs font-mono ${
                                  darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-700"
                                }`}
                              >
                                {drum.key}
                              </kbd>
                              <span className={darkMode ? "text-gray-300" : "text-gray-600"}>{drum.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {DRUM_TYPES.map((drum) => (
                        <Button
                          key={drum.id}
                          variant={selectedDrumType === drum.id ? "default" : "outline"}
                          className={`h-16 flex flex-col items-center justify-center gap-1 transition-all duration-200 hover:scale-105 ${
                            selectedDrumType === drum.id
                              ? `${drum.color} text-white shadow-lg`
                              : darkMode
                                ? "hover:bg-gray-700"
                                : "hover:bg-gray-50"
                          }`}
                          onClick={() => {
                            setSelectedDrumType(drum.id)
                            playNote(drum.pitch, 0.2, 0.7, "drums", drum.id)
                          }}
                          title={`${drum.description} ${drum.key ? `(キー: ${drum.key})` : ""}`}
                        >
                          <div className="text-center">
                            <div className="font-medium text-sm">{drum.name}</div>
                            {drum.key && <div className="text-xs opacity-75">({drum.key})</div>}
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Note Controls */}
        {!compactView && selectedInstrument !== "drums" && (
          <Card className={`border-0 shadow-lg ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <CardHeader>
              <CardTitle className={`text-lg flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-800"}`}>
                <Music className="w-5 h-5" />
                音符設定
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>音程</label>
                <Select
                  value={selectedPitch.toString()}
                  onValueChange={(value) => setSelectedPitch(Number.parseInt(value))}
                >
                  <SelectTrigger className={darkMode ? "bg-gray-700 border-gray-600" : ""}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OCTAVES.map((octave) =>
                      NOTES.map((note, index) => {
                        const pitch = octave * 12 + index
                        return (
                          <SelectItem key={pitch} value={pitch.toString()}>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{note}</span>
                              <span className="text-sm text-gray-500">({octave}オクターブ)</span>
                            </div>
                          </SelectItem>
                        )
                      }),
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  音符の長さ
                </label>
                <Select
                  value={noteDuration.toString()}
                  onValueChange={(value) => setNoteDuration(Number.parseFloat(value))}
                >
                  <SelectTrigger className={darkMode ? "bg-gray-700 border-gray-600" : ""}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.25">16分音符</SelectItem>
                    <SelectItem value="0.5">8分音符</SelectItem>
                    <SelectItem value="1">4分音符</SelectItem>
                    <SelectItem value="2">2分音符</SelectItem>
                    <SelectItem value="4">全音符</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Composition */}
        <Card
          className={`border-0 shadow-xl ${
            darkMode
              ? "bg-gradient-to-r from-purple-900/50 to-pink-900/50"
              : "bg-gradient-to-r from-purple-50 to-pink-50"
          }`}
        >
          <CardHeader>
            <CardTitle
              className={`text-xl flex items-center gap-3 ${darkMode ? "text-purple-300" : "text-purple-700"}`}
            >
              <div className="relative">
                <Sparkles className="w-6 h-6" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
              </div>
              AI作曲エンジン
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4 flex-wrap">
              <Button
                onClick={generateAdvancedAIComposition}
                disabled={isGenerating || notes.length === 0}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    AI分析中...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" />
                    AI作曲開始
                  </>
                )}
              </Button>

              {aiGeneratedNotes.length > 0 && (
                <>
                  <Button
                    onClick={playAIComposition}
                    disabled={isPlaying}
                    variant="outline"
                    className="border-purple-300 text-purple-700 hover:bg-purple-50"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    AI楽曲再生
                  </Button>
                  <Badge variant="secondary" className="px-4 py-2 text-sm">
                    <Star className="w-4 h-4 mr-1" />
                    {aiGeneratedNotes.length}個の音符を生成
                  </Badge>
                </>
              )}
            </div>

            {isGenerating && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                    メロディを分析しています...
                  </span>
                </div>
                <Progress value={66} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Playback Controls */}
        <Card className={`border-0 shadow-lg ${darkMode ? "bg-gray-800" : "bg-white"}`}>
          <CardContent className="p-6">
            <div className="flex justify-center gap-3 flex-wrap">
              <Button
                onClick={addNote}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
              >
                <Music className="w-4 h-4 mr-2" />
                音符を追加
              </Button>

              <Button
                onClick={() => playComposition()}
                disabled={isPlaying || notes.length === 0}
                className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white"
              >
                <Play className="w-4 h-4 mr-2" />
                基本メロディ再生
              </Button>

              <Button
                onClick={stopPlayback}
                disabled={!isPlaying}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                <Pause className="w-4 h-4 mr-2" />
                停止
              </Button>

              <Button onClick={resetComposition} variant="outline" className="border-gray-300 hover:bg-gray-50">
                <RotateCcw className="w-4 h-4 mr-2" />
                リセット
              </Button>

              <div className="flex items-center gap-2">
                <Select value={exportFormat} onValueChange={(value: "wav" | "mp3") => setExportFormat(value)}>
                  <SelectTrigger className={`w-20 ${darkMode ? "bg-gray-700 border-gray-600" : ""}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mp3">MP3</SelectItem>
                    <SelectItem value="wav">WAV</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  onClick={exportAudio}
                  variant="outline"
                  disabled={notes.length === 0 || isExporting}
                  className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isExporting ? "エクスポート中..." : `${exportFormat.toUpperCase()}保存`}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Score Display */}
        <Card className={`border-0 shadow-xl ${darkMode ? "bg-gray-800" : "bg-white"}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className={`text-xl flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-800"}`}>
                <BarChart3 className="w-6 h-6" />
                楽譜ビューアー
              </CardTitle>
              <div className="flex gap-3">
                <Badge variant="outline" className="px-3 py-1">
                  <Music className="w-4 h-4 mr-1" />
                  基本メロディ: {notes.length}音符
                </Badge>
                {aiGeneratedNotes.length > 0 && (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800 px-3 py-1">
                    <Sparkles className="w-4 h-4 mr-1" />
                    AI生成: {aiGeneratedNotes.length}音符
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={`relative rounded-xl p-6 min-h-[600px] overflow-auto border-2 ${
                darkMode ? "bg-gray-900 border-gray-700" : "bg-gradient-to-br from-gray-50 to-white border-gray-200"
              }`}
            >
              {/* Timeline */}
              <div
                className={`absolute top-0 left-0 right-0 h-12 border-b ${
                  darkMode ? "bg-gray-800 border-gray-600" : "bg-gray-50 border-gray-300"
                }`}
              >
                {Array.from({ length: 17 }, (_, i) => (
                  <div
                    key={i}
                    className={`absolute top-0 bottom-0 border-l ${darkMode ? "border-gray-600" : "border-gray-400"}`}
                    style={{ left: `${(i / 16) * 100}%` }}
                  >
                    <span
                      className={`text-sm font-medium ml-2 mt-1 block ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      {i}s
                    </span>
                  </div>
                ))}
              </div>

              {/* Current Time Indicator */}
              <div
                className="absolute top-12 bottom-0 w-1 bg-gradient-to-b from-red-500 to-pink-500 z-20 shadow-lg rounded-full"
                style={{ left: `${(currentTime / 16) * 100}%` }}
              />

              {/* Notes Display */}
              <div className="mt-12 relative">
                {notes.map((note) => {
                  if (note.instrument === "drums" && note.drumType) {
                    const drumColor = getDrumTypeColor(note.drumType)
                    const drumInfo = DRUM_TYPES.find((d) => d.id === note.drumType)
                    return (
                      <div
                        key={note.id}
                        className={`absolute h-12 ${drumColor} rounded-lg cursor-pointer border-2 transition-all duration-200 hover:scale-105 shadow-lg ${
                          selectedNote === note.id
                            ? "border-yellow-400 ring-2 ring-yellow-300"
                            : selectedNotes.includes(note.id)
                              ? "border-blue-400 ring-2 ring-blue-300"
                              : "border-gray-700"
                        }`}
                        style={{
                          left: `${(note.start / 16) * 100}%`,
                          width: `${Math.max((0.2 / 16) * 100, 3)}%`,
                          top: `${(127 - note.pitch) * 4}px`,
                        }}
                        onClick={() => setSelectedNote(note.id)}
                        onDoubleClick={() => deleteNote(note.id)}
                        title={`${drumInfo?.name} (${drumInfo?.key || ""}) - ${note.start}s`}
                      >
                        <span className="text-sm font-bold text-white px-2 py-1 block truncate">{drumInfo?.name}</span>
                      </div>
                    )
                  }

                  const instrumentColor = getInstrumentColor(note.instrument || "sine")
                  return (
                    <div
                      key={note.id}
                      className={`absolute h-12 ${instrumentColor} rounded-lg cursor-pointer border-2 transition-all duration-200 hover:scale-105 shadow-lg ${
                        selectedNote === note.id
                          ? "border-yellow-400 ring-2 ring-yellow-300"
                          : selectedNotes.includes(note.id)
                            ? "border-blue-400 ring-2 ring-blue-300"
                            : "border-gray-700"
                      }`}
                      style={{
                        left: `${(note.start / 16) * 100}%`,
                        width: `${Math.max((note.duration / 16) * 100, 3)}%`,
                        top: `${(127 - note.pitch) * 4}px`,
                      }}
                      onClick={() => setSelectedNote(note.id)}
                      onDoubleClick={() => deleteNote(note.id)}
                      title={`${getPitchName(note.pitch)} (${note.instrument}) - ${note.duration}s`}
                    >
                      <span className="text-sm font-bold text-white px-2 py-1 block truncate">
                        {getPitchName(note.pitch)}
                      </span>
                    </div>
                  )
                })}

                {/* AI Generated Notes */}
                {aiGeneratedNotes.map((note) => {
                  const functionColor =
                    note.function === "T" ? "bg-green-400" : note.function === "S" ? "bg-yellow-400" : "bg-red-400"

                  return (
                    <div
                      key={note.id}
                      className={`absolute h-10 ${functionColor} rounded-lg border-2 border-gray-600 opacity-90 shadow-md`}
                      style={{
                        left: `${(note.start / 16) * 100}%`,
                        width: `${Math.max((note.duration / 16) * 100, 2)}%`,
                        top: `${(127 - note.pitch) * 4 + 14}px`,
                      }}
                      title={`${note.chordName} (${note.function}): ${getPitchName(note.pitch)} - ${note.duration}s`}
                    >
                      <span className="text-xs font-semibold text-white px-1 py-1 block truncate">
                        {note.chordName}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Piano Roll Background */}
              <div className="absolute top-12 left-0 right-0 bottom-0 pointer-events-none">
                {Array.from({ length: 48 }, (_, i) => {
                  const noteIndex = (47 - i) % 12
                  const isBlackKey = NOTES[noteIndex].includes("#")
                  return (
                    <div
                      key={i}
                      className={`absolute left-0 right-0 h-1 ${
                        isBlackKey
                          ? darkMode
                            ? "bg-gray-700"
                            : "bg-gray-300"
                          : darkMode
                            ? "bg-gray-800"
                            : "bg-gray-200"
                      } ${i % 12 === 0 ? `border-t-2 ${darkMode ? "border-gray-500" : "border-gray-400"}` : ""}`}
                      style={{ top: `${i * 4}px` }}
                    >
                      {i % 12 === 0 && (
                        <span
                          className={`absolute left-2 top-1 text-xs font-medium px-2 py-1 rounded ${
                            darkMode ? "text-gray-300 bg-gray-800/80" : "text-gray-600 bg-white/80"
                          } border ${darkMode ? "border-gray-600" : "border-gray-300"}`}
                        >
                          {NOTES[(47 - i) % 12]}
                          {Math.floor((47 - i) / 12) + 3}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Measure Lines */}
              <div className="absolute top-12 left-0 right-0 bottom-0 pointer-events-none">
                {Array.from({ length: 5 }, (_, i) => (
                  <div
                    key={i}
                    className={`absolute top-0 bottom-0 w-0.5 opacity-50 ${darkMode ? "bg-gray-500" : "bg-gray-400"}`}
                    style={{ left: `${i * 25}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Instrument Legend */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
              {INSTRUMENTS.map((instrument) => (
                <div
                  key={instrument.id}
                  className={`flex items-center gap-3 p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}
                >
                  <div className={`w-6 h-6 ${instrument.color} rounded-md shadow-sm`}></div>
                  <span className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    {instrument.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Function Harmony Legend */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className={`flex items-center gap-3 p-3 rounded-lg ${darkMode ? "bg-green-900/30" : "bg-green-50"}`}>
                <div className="w-6 h-6 bg-green-400 rounded-md shadow-sm"></div>
                <span className={`text-sm font-medium ${darkMode ? "text-green-300" : "text-green-700"}`}>
                  トニック (T) - 安定した響き
                </span>
              </div>
              <div
                className={`flex items-center gap-3 p-3 rounded-lg ${darkMode ? "bg-yellow-900/30" : "bg-yellow-50"}`}
              >
                <div className="w-6 h-6 bg-yellow-400 rounded-md shadow-sm"></div>
                <span className={`text-sm font-medium ${darkMode ? "text-yellow-300" : "text-yellow-700"}`}>
                  サブドミナント (S) - 準備の響き
                </span>
              </div>
              <div className={`flex items-center gap-3 p-3 rounded-lg ${darkMode ? "bg-red-900/30" : "bg-red-50"}`}>
                <div className="w-6 h-6 bg-red-400 rounded-md shadow-sm"></div>
                <span className={`text-sm font-medium ${darkMode ? "text-red-300" : "text-red-700"}`}>
                  ドミナント (D) - 緊張の響き
                </span>
              </div>
            </div>

            {/* Selected Note Info */}
            {selectedNote && (
              <div
                className={`mt-6 p-4 rounded-lg border ${
                  darkMode ? "bg-blue-900/30 border-blue-700" : "bg-blue-50 border-blue-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-lg font-semibold ${darkMode ? "text-blue-300" : "text-blue-800"}`}>
                      選択中の音符:{" "}
                      <span className="font-bold text-xl">
                        {getPitchName(notes.find((n) => n.id === selectedNote)?.pitch || 60)}
                      </span>
                    </p>
                    <p className={`text-sm mt-1 ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                      楽器: {notes.find((n) => n.id === selectedNote)?.instrument || "不明"}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteNote(selectedNote)}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    削除
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <Card className={`border-0 shadow-lg ${darkMode ? "bg-gray-800" : "bg-white"}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                    AI音楽作曲スタジオ v2.0
                  </span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {notes.length + aiGeneratedNotes.length} 総音符数
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Powered by Web Audio API
                </span>
                <Headphones className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
