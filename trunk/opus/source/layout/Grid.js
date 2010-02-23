opus.Class("opus.layout.Grid", {
	isa: opus.Layout,
	styles: {
	},
	// FIXME: we don't have a good way of managing layout specific container properties
	// one possibility is to leverage the property publishing system
	published: {
		layoutCellWidth: {value: 100},
		layoutCellHeight: {value: 100}
	},
	getLayoutCellWidth: function(inContainer) {
		return inContainer.layoutCellWidth || this.layoutCellWidth;
	},
	getLayoutCellHeight: function(inContainer) {
		return inContainer.layoutCellHeight || this.layoutCellHeight;
	},
	_flow: function(inC$, inB, inContainer) {
		var cr = inContainer;
		// determine # columns and scrolling state
		var ex = this.calcExtents(inC$, inB, cr);
		cr.bounds.scrollbarExtents = {w: ex.overflow ? 17 : 0, h: 0};
		// overflow or autosize?
		if (cr.height == "auto") {
			cr.bounds.setClientSize({h: ex.h});
		} else if (cr.scroll) {
			if (cr.style.styles.overflowY != ex.overflow) {
				cr.style.addStyles({overflowY: ex.overflow});
				cr.bounds.boundsDirty = cr.bounds.sizeDirty = true;
			}
		}
		var cb = cr.getClientBounds();
		//
		var cw = this.getLayoutCellWidth(cr);
		var ch = this.getLayoutCellHeight(cr);
		var ew = 0;
		// adjust for columns stretching or centering content
		if (cr.layoutStretchColumns || this.layoutStretchColumns) {
			cw = cb.w / ex.columns;
		} else {
			ew = (cb.w - ex.columns * cw) / 2;
		}
		//
		var b = {t: cb.t, l: cb.l + ew, w: cw, h: ch};
		//
		for (var i=0, c; c=inC$[i]; i++) {
			c.bounds.setBounds(b);
			if (c.flow) {
				c.flow();
			}
			b.l += cw;
			if (i % ex.columns == ex.columns-1) {
				b.l = cb.l + ew;
				b.t += ch;
			}
		}
	},
	calcHeight: function(inC$, inContainer, inCols) {
		var rows = Math.ceil(inC$.length / inCols);
		return rows * this.getLayoutCellHeight(inContainer);
	},
	calcExtents: function(inC$, inB, inContainer) {
		var w = inB.w + inContainer.bounds.scrollbarExtents.w;
		var cw = this.getLayoutCellWidth(inContainer);
		var ch = this.getLayoutCellHeight(inContainer);
		var columns = Math.max(Math.floor(w / cw), 1);
		var h = this.calcHeight(inC$, inContainer, columns);
		var overflow = (h > inB.h);
		if (overflow && inContainer.height != "auto") {
			// FIXME: hardcoded scrollbar width is bad
			columns = Math.max(Math.floor((w - 17) / cw), 1);
		}
		return {
			columns: columns,
			h: h,
			overflow: overflow ? "auto" : null
		};
	}
});


/*
opus.Layout.subclass("opus.layout.VGrid", {
	flow: function(inC$, inB, inContainer) {
		var ex = this.calcExtents(inC$, inB, inContainer);
		var clientWidth = inB.w - (ex.bottom > inB.h ? 17 : 0);
		var colWidth = inContainer.layoutColumns ? clientWidth / inContainer.layoutColumns : clientWidth;
		var b = {t: inB.t - inContainer.layoutCellHeight};
		var maxh=0, col=0, row=-1, l;
		for (var i=0, c; c=inC$[i]; i++) {
			col = i % inContainer.layoutColumns;
			if (col == 0) {
				row++;
				l = inB.l;
				b.t += inContainer.layoutCellHeight;
			}
			// FIXME: I broke this
			//b.t = ex.tops[row];
			//b.l = inB.l + (col * colWidth);
			b.l = l;
			l += colWidth;
			//
			if (inContainer.layoutCellWidth) {
				b.w = inContainer.layoutCellWidth;
			} else if (c._width) {
				if (c._width.units == "%") {
					b.w = colWidth * c._width.value * ex.percents[row];
				} else {
					b.w = Math.min(c._width.value, colWidth);
				}
			} else {
				b.w = colWidth;
			}
			//
			if (inContainer.layoutCellHeight) {
				b.h = inContainer.layoutCellHeight;
			} else if (c._height.units == "%") {
				b.h = inB.h * c._height.value * 0.01;
			}
			//
			c.bounds.setBounds(b);
			if (c.flow) {
				c.flow();
			}
			maxh = Math.max(maxh, c.bounds.h);
		}
	},
	calcExtents: function(inC$, inB, inContainer) {
		var tops = [0], percents=[], bottom=0;
		var maxh=0, maxr=0, h;
		for (var i=0, l=inC$.length-1, c; c=inC$[i]; i++) {
			if (inContainer.layoutCellHeight) {
				h = maxh = inContainer.layoutCellHeight;
			} else{
				h = c._height.units == "%" ? inB.h * c._height.value * 0.01 : c._height.value;
				maxh = Math.max(maxh, h);
			}
			if (c._width) {
				if (c._width.units == "%") {
					maxr = Math.max(maxr, c._width.value);
				}
			}
			//
			if (((i+1) % inContainer.layoutColumns == 0) || (i==l)) {
				bottom += maxh;
				tops.push(bottom);
				percents.push(maxr> 100 ? 1/maxr : 0.01);
				maxh=maxr=0;
			}
		}
		return {tops: tops, percents: percents, bottom: bottom};
	}
});
*/

opus.layoutRegistry.register("grid", opus.layout.Grid);
