/**
 * Open Report Form Builder and Valdation
 *
 * Copyright 2013, The Austin Conner Group
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
;(function($){
/**
 *
 * Usage:  		$("#formId").buildForm(formMeta, options);
 * Alt Usage:	$.buildForm('#testForm', formMeta, options)
 *
 */
  $.buildForm = function(el, formMeta, options){
	// To avoid scope issues, use 'base' instead of 'this'
	// to reference this class from internal events and functions.
	var base = this;

	// Access to jQuery and DOM versions of element
	base.$el = $(el);
	base.el = el;
	// Add a reverse reference to the DOM object
	base.$el.data("buildForm", base);
	base.init = function(){

	  if( typeof( formMeta ) === "undefined" || formMeta === null ) formMeta = {"name":"form",};

	  base.formMeta = formMeta;
	  base.options = $.extend({},$.buildForm.defaultOptions, options);

	  // Build the form
	  // create fieldset
	  var fs = base.$el.append(document.createElement('fieldset')).find('fieldset');
	  // loop through form definations
	  for (index in formMeta.fields){
		field = formMeta.fields[index];
		// field wrapper
		fieldSet = document.createElement('div');
		fieldSet.setAttribute("class", base.options.ctrlClass);
		fieldSet.setAttribute("data-rules", field.rules);
		fieldSet.setAttribute("data-type", field.type);
		fieldSet.setAttribute("data-name", field.name);
		fs.append(fieldSet);
		// add form label
		$(fieldSet).append(helper.createLabel(field.name, field.display));
		// render input fields
		switch(field.type){
		  case 'text':
			  helper.buildTextBox(fieldSet, field.name);
			  break;
		  case 'paragraph':
			  helper.buildParagraphBox(fieldSet, field.name);
			  break;
		  case 'checkbox':
			  helper.buildCheckbox(fieldSet, field.name, field.values);
			  break;
		  case 'radio':
			  helper.buildRadio(fieldSet, field.name, field.values);
			  break;
		  case 'select':
			  helper.buildSelect(fieldSet, field.name, field.values);
			  break;
		}
		$(fieldSet).append('<span class="error"></span>');
	  }
	  fs.append('<input id="submitForm" type="submit" value="Submit">');

	};
	// private functions
	var helper = {
	  createLabel:function(name, title){
		var label = document.createElement('label');
		label.setAttribute('for',name);
		$(label).append(title);
		return label;
	  },
	  buildTextBox: function(el, name){
		$(el).append(createInput(name, 'text', ''));
	  },

	  buildParagraphBox: function(selector, name){
		  $(selector).append(createText(name));
	  },

	  buildCheckbox: function(selector, name, values){
		  //ul
		  var ul = document.createElement('ul');
		  $(selector).append(ul);

		  for (index in values){
			  var li = document.createElement('li');
			  field = values[index];
			  $(li).append(createInput(name, 'checkbox', field.value)).append(field.label);
			  $(ul).append(li);
		  }
	  },
	  buildRadio: function(selector, name, values){
		  //ul
		  var ul = document.createElement('ul');
		  $(selector).append(ul);
		  for (index in values){
			  var li = document.createElement('li');
			  field = values[index];
			  $(li).append(createInput(name, 'radio', field.value)).append(field.label);
			  $(ul).append(li);
		  }
	  },
	  buildSelect: function(selector, name, values){

		  var select = createSelect(name);
		  $(selector).append(select);
		  $(select).append(createOption("Select One", 0));
		  // build options for select
		  for (index in values){
			  field = values[index];
			  $(select).append(createOption(field.label, field.value));
		  }
	  }
	}
	// Run initializer
	base.init();

	// low level libs
	// input type text
	function createInput(name, type, value){
		var field = document.createElement('input');
		field.setAttribute('name',name);
		field.setAttribute('id',name);
		field.setAttribute('value',value);
		field.setAttribute('type',type);
		return field;
	}
	// textarea (paragraph)
	function createText(name){
		var field = document.createElement('textarea');
		field.setAttribute('name',name);
		field.setAttribute('id',name);
		return field;
	}

	function createSelect(name){
		var field = document.createElement('select');
		field.setAttribute('id',name);
		field.setAttribute('name',name);
		return field;
	}
	//
	function createOption(label, value){
		var option=document.createElement("option");
		option.text = label;
		option.value = value;
		return option;
	}

  };

  $.buildForm.defaultOptions = {
	  ctrlClass: "ctrl",
	  lblClass: "ctrlLabel",
	  fldClass: "ctrlField",
	  errClass: "ctrlError"
  };
  $.fn.buildForm = function(formMeta, options){
  // return for chaining
	  return this.each(function(){
		  (new $.buildForm(this, formMeta, options));
	  });
  };


  /**
   *
   * Usage:  		$("#formId").validate();
   * Alt Usage:	$.validate('#testForm', options)
   *
   */
  $.validateForm = function(el, success, failure, options){
	// To avoid scope issues, use 'base' instead of 'this'
	// to reference this class from internal events and functions.
	var base = this;

	// Access to jQuery and DOM versions of element
	base.$el = $(el);
	base.el = el;
	// Add a reverse reference to the DOM object
	base.$el.data("validateForm", base);
	// regex patterns
	var ruleRegex = /^(.+?)\[(.+)\]$/,
		numericRegex = /^[0-9]+$/,
		integerRegex = /^\-?[0-9]+$/,
		decimalRegex = /^\-?[0-9]*\.?[0-9]+$/,
		emailRegex = /^[a-zA-Z0-9.!#$%&amp;'*+\-\/=?\^_`{|}~\-]+@[a-zA-Z0-9\-]+(?:\.[a-zA-Z0-9\-]+)*$/,
		alphaRegex = /^[a-z]+$/i,
		alphaNumericRegex = /^[a-z0-9]+$/i,
		alphaDashRegex = /^[a-z0-9_\-]+$/i,
		naturalRegex = /^[0-9]+$/i,
		naturalNoZeroRegex = /^[1-9][0-9]*$/i,
		ipRegex = /^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/i,
		base64Regex = /[^a-zA-Z0-9\/\+=]/i,
		numericDashRegex = /^[\d\-\s]+$/,
		urlRegex = /^((http|https):\/\/(\w+:{0,1}\w*@)?(\S+)|)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/;

	base.init = function(){
	  base.options = $.extend({},$.validateForm.defaultOptions, options);
	  // process
	  var errorCnt = 0;
	  base.$el.find('div').each(function(i){
            // fetch rules
			var ctl = $(this).data('rules');
			if(typeof(ctl) !== 'undefined'){
				var rules = ctl.split("|");
				var name = $(this).data('name');
				rules.forEach(function(rule, index){
					// 1st Test
					if(rule === 'required'){
						$('span',this).text('');
						switch($(this).data('type')){
							case 'text':
							case 'paragraph':
								var field = $('#'+name);
								if((field.val() === null || field.val() === '')){
									errorCnt++;
									$('span',this).text(base.options.messages[rule]);
								}
							break;
							case 'checkbox':
							case 'radio':
								var field = $('input[name='+name+']:checked');
								if((field.length == 0)){
									$('span',this).text(base.options.messages[rule]);
									errorCnt++;
								}
							break;
							case 'select':
								if($('select[name='+name+']').val() == 0){
									$('span',this).text(base.options.messages[rule]);
									errorCnt++;
								}
							break;
						}
					}
					else if($(this).data('type') === 'text'){
						var field = $('#'+name);
						var span = $('span',this);
						switch(rule){

							case 'alpha':
								if(!alphaRegex.test(field.val())){
									span.text(base.options.messages[rule]);
									errorCnt++;
								}
							break;
							case 'alpha_numeric':
								if(!alphaNumericRegex.test(field.val())){
									span.text(base.options.messages[rule]);
									errorCnt++;
								}
							break;
							case 'alpha_dash':
								if(!alphaDashRegex.test(field.val())){
									span.text(base.options.messages[rule]);
									errorCnt++;
								}
							break;
							case 'is_natural':
								if(!naturalRegex.test(field.val())){
									span.text(base.options.messages[rule]);
									errorCnt++;
								}
							break;
							case 'is_natural_no_zero':
								if(!naturalNoZeroRegex.test(field.val())){
									span.text(base.options.messages[rule]);
									errorCnt++;
								}
							break;
							case 'numeric':
								if(!numericRegex.test(field.val())){
									span.text(base.options.messages[rule]);
									errorCnt++;
								}
							break;
							case 'integer':
								if(!integerRegex.test(field.val())){
									span.text(base.options.messages[rule]);
									errorCnt++;
								}
							break;
							case 'decimal':
								if(!decimalRegex.test(field.val())){
									span.text(base.options.messages[rule]);
									errorCnt++;
								}
							break;
						}
					}
					// process other validation rules

				}, this);

			}

		});

		if(errorCnt > 0){
			if (typeof failure === 'function') {
				failure(errorCnt);
			}
		}
		else{
			if (typeof success === 'function') {
				success();
			}
		}

	};
	// Run initializer
	base.init();
  };
  $.validateForm.defaultOptions = {
	messages:{
	  required: 'This field is required.',
	  valid_email: 'This field must contain a valid email address.',
	  alpha: 'This field must only contain alphabetical characters.',
	  alpha_numeric: 'This field must only contain alpha-numeric characters.',
	  alpha_dash: 'This field must only contain alpha-numeric characters, underscores, and dashes.',
	  numeric: 'This field must contain only numbers.',
	  integer: 'This field must contain an integer.',
	  decimal: 'This field must contain a decimal number.',
	  is_natural: 'This field must contain only positive numbers.',
	  is_natural_no_zero: 'This field must contain a number greater than zero.',
	  valid_ip: 'This field must contain a valid IP.',
	  valid_base64: 'This field must contain a base64 string.',
	  valid_credit_card: 'This field must contain a vaild credit card number',
	  valid_url: 'This field must contain a valid URL.'
    }
  };
  $.fn.validateForm = function(formMeta, options){
  // return for chaining
	  return this.each(function(){
		  (new $.validateForm(this, options));
	  });
  };
})(window.Zepto || window.jQuery);
