(function ($) {
	"use strict";

	var documentTitleBase = document.title;
	var $body = $('body');
	var $galleryItems = $('#gallery > .cell');
	var $overlayRoot;

	function prepareDetailNode($detailNode) {
		$detailNode
			.find('img').each(function () {
			var $img = $(this);
			$img.attr('src', $img.attr('data-lazy-src'));
		});

		$detailNode.find('video').each(function () {
			var $video = $(this);
			$video.attr('poster', $video.attr('data-lazy-poster'));
		});

		return $detailNode;
	}

	function prevItem(id) {
		return function() {
			var idx = $('#' + id).index();
			if (idx > 0) {
				idx--;
			} else {
				idx = $galleryItems.length - 1;
			}

			var item = $galleryItems.eq(idx);
			showOverlay(item.attr('id'), item.find('.detail'));
		}
	}

	function nextItem(id) {
		return function() {
			var idx = $('#' + id).index();
			idx = (idx + 1) % $galleryItems.length;
			var item = $galleryItems.eq(idx);
			showOverlay(item.attr('id'), item.find('.detail'));
		}
	}

	function showOverlay(id, $detailNode, animate) {
		animate = animate == undefined ? true : animate;
		if (!$overlayRoot) {

			$overlayRoot = $('<div>', {class: 'detail-overlay'});
			$body.append($overlayRoot);

			$body.addClass('overlay-visible');

			$overlayRoot.css({
				display: 'block'
			});

			if (animate) {
				$overlayRoot.animate({
					opacity: 1
				}, {
					duration: 200
				});
			} else {
				$overlayRoot.css({
					opacity: 1
				});
			}
		}

		var $overlayContent = $('<div>').addClass('content');
		var $controlRow = $('<div>', { class: 'controls' });
		var $closeButton = $('<a>', {text: 'Close', class: 'close'});
		var $prevButton = $('<a>', {text: 'Prev', class: 'prev'});
		var $nextButton = $('<a>', {text: 'Next', class: 'next'});
		var $iterator = $('<div>', { class: 'iterator' });
		$closeButton.click(hideOverlay);
		$prevButton.click(prevItem(id));
		$nextButton.click(nextItem(id));

		$detailNode = $detailNode.clone();
		prepareDetailNode($detailNode);
		$iterator.append([$prevButton, $nextButton]);
		$controlRow.append([$closeButton, $iterator]);
		$overlayContent.append($controlRow).append($detailNode.contents());
		$overlayRoot.empty().append($overlayContent);

		// now update window hash
		history.pushState(null, null, '#' + id);
		document.title = documentTitleBase + " : " + $overlayContent.find('h1').text();
	}

	function hideOverlay(animate) {
		animate = animate == undefined ? true : animate;
		if (!!$overlayRoot) {
			history.pushState(null, null, '/');
			document.title = documentTitleBase;
			$body.removeClass('overlay-visible');

			if (animate) {
				var $r = $overlayRoot;
				$overlayRoot = null;
				$r.animate({
					opacity: 0
				}, {
					duration: 400,
					complete: function () {
						$r.remove();
					}
				});
			} else {
				$overlayRoot.remove();
				$overlayRoot = null;
			}
		}
	}


	$('.gallery .cell > img').each(function () {
		var $trigger = $(this);
		$trigger.click(function () {
			var $detail = $trigger.parent().find('.detail');
			var id = $trigger.parent().attr('id');
			showOverlay(id, $detail);
		});
	});

	document.onkeydown = function (e) {
		switch (e.keyCode) {
			case 27:
				hideOverlay();
		}
	};

	function syncToHash(animate) {
		var hash = document.location.hash.substr(1);
		//console.log('onpopstate: hash: ', hash);
		var $item = $('#' + hash);
		if ($item.length) {
			var $detail = $item.find('.detail');
			showOverlay(hash, $detail, animate);
		} else {
			hideOverlay(animate);
		}
	}

	window.onpopstate = function () {
		syncToHash(true);
	};

	syncToHash(false);

}(Zepto));