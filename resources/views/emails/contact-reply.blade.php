<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Balasan dari Ngesti Laras Budaya</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
            color: #333;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }

        .card {
            background: #fff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .header {
            background: linear-gradient(135deg, #991b1b, #7f1d1d);
            padding: 28px 24px;
            text-align: center;
        }

        .header h1 {
            color: #fff;
            font-size: 20px;
            margin: 0;
            font-weight: 600;
        }

        .header p {
            color: rgba(255, 255, 255, 0.7);
            font-size: 13px;
            margin: 6px 0 0;
        }

        .body {
            padding: 28px 24px;
        }

        .greeting {
            font-size: 16px;
            margin-bottom: 16px;
        }

        .reply-content {
            font-size: 14px;
            line-height: 1.7;
            white-space: pre-wrap;
            margin-bottom: 24px;
        }

        .original {
            background: #f9fafb;
            border-left: 3px solid #d1d5db;
            padding: 4px 6px;
            border-radius: 0 8px 8px 0;
            margin-bottom: 24px;
        }

        .original-label {
            font-size: 12px;
            color: #6b7280;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 6px;
        }

        .original-text {
            font-size: 13px;
            color: #6b7280;
            white-space: pre-wrap;
            line-height: 1.6;
        }

        .footer {
            border-top: 1px solid #e5e7eb;
            padding: 20px 24px;
            text-align: center;
        }

        .footer p {
            font-size: 12px;
            color: #9ca3af;
            margin: 0;
        }

        .footer a {
            color: #991b1b;
            text-decoration: none;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="card">
            <div class="header">
                <h1>Ngesti Laras Budaya</h1>
                <p>{{ $siteTagLine ?? 'Sanggar Tari Tradisional' }}</p>
            </div>
            <div class="body">
                <p class="greeting">Halo <strong>{{ $recipientName }}</strong>,</p>
                <p style="font-size: 14px; color: #6b7280; margin-bottom: 16px;">
                    Terima kasih sudah menghubungi kami. Berikut balasan dari kami:
                </p>
                <div class="reply-content">{{ $replyBody }}</div>
                <div class="original">
                    <p class="original-label">Pesan asli Anda:</p>
                    <p class="original-text">{{ $originalMessage }}</p>
                </div>
                <p style="font-size: 13px; color: #6b7280;">
                    Salam hangat,<br>
                    <strong>{{ $replierName }}</strong><br>
                    Ngesti Laras Budaya
                </p>
            </div>
            <div class="footer">
                <p>
                    <a href="{{ $siteUrl }}">{{ $siteUrl }}</a> &bull;
                    Meteseh, Boja, Kendal
                </p>
            </div>
        </div>
    </div>
</body>

</html>