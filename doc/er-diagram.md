# DB設計

## テーブル構成

テーブルは下記の構成とする

```mermaid
erDiagram

users {
  UUID id PK
  TEXT email
  TEXT password_digest
  TIMESTAMP created_at
  TIMESTAMP updated_at
}

subscriptions {
  UUID id PK
  UUID user_id FK
  TEXT service_name
  NUMERIC price
  TEXT currency_code FK
  TEXT billing_cycle
  DATE start_date
  DATE next_renewal_date
  INTEGER notify_before
  BOOLEAN is_active
  INTEGER category_id FK
  TIMESTAMP created_at
  TIMESTAMP updated_at
}

notifications {
  UUID id PK
  UUID subscription_id FK
  TIMESTAMP sent_at
  TEXT channel
}

categories {
  INTEGER id PK
  TEXT name
}

currencies {
  TEXT code PK
  TEXT name
}

exchange_rates {
  UUID id PK
  TEXT base_currency FK
  TEXT target_currency FK
  NUMERIC rate
  DATE date
}

users ||--o{ subscriptions : "所有する"
subscriptions ||--o{ notifications : "通知をトリガーする"
subscriptions }o--|| categories : "分類される"
subscriptions }o--|| currencies : "支払い通貨"
exchange_rates }o--|| currencies : "基準通貨"
exchange_rates }o--|| currencies : "対象通貨"
```

## テーブル定義

テーブル定義は下記のSQLにて行う

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_digest TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE currencies (
  code TEXT PRIMARY KEY, -- 例: 'USD', 'JPY'
  name TEXT NOT NULL     -- 例: 'USドル', '日本円'
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  currency_code TEXT REFERENCES currencies(code),
  billing_cycle TEXT NOT NULL, -- 例: 'monthly', 'yearly'
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
  channel TEXT DEFAULT 'email' -- 他の通知方法に対応するための拡張性を考慮
);

CREATE TABLE exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_currency TEXT NOT NULL REFERENCES currencies(code),
  target_currency TEXT NOT NULL REFERENCES currencies(code),
  rate NUMERIC(10, 4) NOT NULL,
  date DATE NOT NULL
);
```
