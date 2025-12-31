export interface RuffRule {
  code: string // "D203"
  name: string // "one-blank-line-before-class"
  summary: string // ルールの説明
  category: string // "pydocstyle (D)"
  categoryCode: string // "D"
  status: 'stable' | 'preview' | 'deprecated' | 'removed'
  documentUrl: string // 詳細ドキュメントのURL
  whyBad?: string // "Why is this bad?"セクションの内容
  example?: string // "Example"セクションの内容
}

export interface RuffVersion {
  version: string // "0.1.0"
  fetchedAt: string // ISO 8601形式
}

export interface RulesData {
  version: RuffVersion
  rules: RuffRule[]
}

export interface RuleSettings {
  [ruleCode: string]: {
    enabled: boolean
    comment?: string
  }
}
