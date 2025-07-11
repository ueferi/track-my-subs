# DB設計

## テーブル構成

テーブルは下記の構成とする

```mermaid
erDiagram

users {
  UUID id PK
  STRING email
  STRING password_digest
  TIMESTAMP created_at
  TIMESTAMP updated_at
}

subscriptions {
  UUID id PK
  UUID user_id FK "→ users.id"
  STRING name
  NUMERIC price
  INTEGER currency_id FK "→ currencies.id"
  STRING billing_cycle
  DATE start_date
  DATE next_renewal_date
  INTEGER notify_before
  BOOLEAN is_active
  INTEGER category_id FK "→ categories.id"
  TIMESTAMP created_at
  TIMESTAMP updated_at
}

notifications {
  UUID id PK
  UUID subscription_id FK "→ subscriptions.id"
  TIMESTAMP sent_at
  STRING channel
  TIMESTAMP created_at
  TIMESTAMP updated_at
}

categories {
  INTEGER id PK
  STRING name
  TIMESTAMP created_at
  TIMESTAMP updated_at
}

currencies {
  INTEGER id PK
  STRING code
  STRING name
  TIMESTAMP created_at
  TIMESTAMP updated_at
}

exchange_rates {
  UUID id PK
  INTEGER base_currency_id FK "→ currencies.id"
  INTEGER target_currency_id FK "→ currencies.id"
  NUMERIC rate
  DATE date
  TIMESTAMP created_at
  TIMESTAMP updated_at
}

users ||--o{ subscriptions : "ユーザーごとの契約"
subscriptions ||--o{ notifications : "通知"
subscriptions }o--|| categories : "分類"
subscriptions }o--|| currencies : "支払い通貨"
exchange_rates }o--|| currencies : "基準通貨"
exchange_rates }o--|| currencies : "対象通貨"
```

## テーブル定義

テーブル定義は下記のSQLにて行う

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_digest VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE currencies (
  id SERIAL PRIMARY KEY,
  code VARCHAR(16) UNIQUE NOT NULL, -- 例: 'USD', 'JPY'
  name VARCHAR(32) NOT NULL,        -- 例: 'USドル', '日本円'
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- ユーザーごとの契約情報を表す
  name VARCHAR(255) NOT NULL, -- サービス名（例: Netflix, Spotify など）
  price NUMERIC(10, 2) NOT NULL,
  currency_id INTEGER REFERENCES currencies(id), -- 数値IDによる外部キー
  billing_cycle VARCHAR(32) NOT NULL, -- 例: 'monthly', 'yearly'
  start_date DATE NOT NULL,
  next_renewal_date DATE NOT NULL,
  notify_before INTEGER DEFAULT 7,
  is_active BOOLEAN DEFAULT TRUE,
  category_id INTEGER REFERENCES categories(id),
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  sent_at TIMESTAMP,
  channel VARCHAR(32) DEFAULT 'email', -- 他の通知方法に対応するための拡張性を考慮
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_currency_id INTEGER NOT NULL REFERENCES currencies(id),
  target_currency_id INTEGER NOT NULL REFERENCES currencies(id),
  rate NUMERIC(10, 4) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
```
