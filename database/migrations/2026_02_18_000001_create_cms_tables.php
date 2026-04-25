<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Site Settings - untuk pengaturan global site
        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('type')->default('text'); // text, textarea, image, json
            $table->string('group')->default('general'); // general, contact, seo, homepage
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Social Links - untuk link social media
        Schema::create('social_links', function (Blueprint $table) {
            $table->id();
            $table->string('platform'); // instagram, facebook, youtube, tiktok, twitter, linkedin, whatsapp
            $table->string('url');
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Post Categories - untuk kategori berita/kegiatan
        Schema::create('post_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('color')->default('#3b82f6'); // untuk badge color
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        // Posts - untuk berita dan kegiatan
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('excerpt')->nullable();
            $table->longText('content');
            $table->string('featured_image');
            $table->foreignId('category_id')->constrained('post_categories')->onDelete('cascade');
            $table->foreignId('author_id')->constrained('users')->onDelete('cascade');
            $table->enum('status', ['draft', 'published'])->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->text('meta_keywords')->nullable();
            $table->string('video_url')->nullable(); // YouTube/Vimeo embed URL
            $table->integer('views')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index('published_at');
            $table->index(['status', 'published_at']);
        });

        // Events - untuk kalender kegiatan
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->dateTime('start_date');
            $table->dateTime('end_date')->nullable();
            $table->string('location')->nullable();
            $table->enum('event_type', ['latihan', 'ujian', 'pentas', 'libur', 'other'])->default('latihan');
            $table->string('color')->default('#3b82f6'); // untuk calendar display
            $table->boolean('is_cancelled')->default(false);
            $table->text('cancel_reason')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->index('start_date');
            $table->index('event_type');
            $table->index(['start_date', 'is_cancelled']);
        });

        // Media Library - untuk manage semua media
        Schema::create('media', function (Blueprint $table) {
            $table->id();
            $table->string('filename');
            $table->string('original_filename');
            $table->string('path');
            $table->string('disk')->default('public');
            $table->string('mime_type');
            $table->string('extension');
            $table->unsignedBigInteger('size'); // in bytes
            $table->integer('width')->nullable();
            $table->integer('height')->nullable();
            $table->text('alt_text')->nullable();
            $table->text('caption')->nullable();
            $table->foreignId('uploaded_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->index('mime_type');
            $table->index('uploaded_by');
        });

        // Gallery Items - untuk gallery dengan approval
        Schema::create('gallery_items', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->foreignId('uploaded_by')->constrained('users')->onDelete('cascade');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('reviewed_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->integer('order')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->timestamps();

            $table->index('status');
            $table->index('uploaded_by');
            $table->index(['status', 'is_featured']);
        });

        // Gallery Images - untuk multiple images per gallery item
        Schema::create('gallery_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('gallery_item_id')->constrained('gallery_items')->onDelete('cascade');
            $table->foreignId('media_id')->constrained('media')->onDelete('cascade');
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();

            $table->index('gallery_item_id');
        });

        // Pages - untuk konten halaman statis
        Schema::create('pages', function (Blueprint $table) {
            $table->id();
            $table->string('page_key')->unique(); // 'home', 'about', 'contact'
            $table->string('title');
            $table->json('sections'); // JSON untuk berbagai section per page
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->text('meta_keywords')->nullable();
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gallery_images');
        Schema::dropIfExists('gallery_items');
        Schema::dropIfExists('media');
        Schema::dropIfExists('events');
        Schema::dropIfExists('posts');
        Schema::dropIfExists('post_categories');
        Schema::dropIfExists('social_links');
        Schema::dropIfExists('pages');
        Schema::dropIfExists('site_settings');
    }
};
